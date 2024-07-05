// クライアントIDを設定します（Google Developers Consoleから取得）
const CLIENT_ID = '837106017981-ifl4tt9ijji70qn9oj0dngn8nlodtu9f.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAeLNPl20qikx_tzt2fOSuGIbCy-3VhKCE';

// 必要なスコープを設定
const SCOPES = 'https://www.googleapis.com/auth/youtube.force-ssl';

let apiInitialized = false;

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPES,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
    }).then(function () {
        apiInitialized = true;
        console.log('API client initialized');
    }, function(error) {
        console.error('Error initializing the API client:', error);
    });
}

function saveToPlaylist() {
    if (!apiInitialized) {
        alert('API の初期化中です。しばらくお待ちください。');
        return;
    }

    const videoUrl = document.getElementById('videoUrl').value;
    const videoId = extractVideoId(videoUrl);

    if (!videoId) {
        alert('有効なYouTube動画URLを入力してください。');
        return;
    }

    gapi.auth2.getAuthInstance().signIn().then(function() {
        createPlaylist(videoId);
    }).catch(function(error) {
        console.error('Sign in error:', error);
        alert('サインインに失敗しました: ' + error.error);
    });
}

function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function createPlaylist(videoId) {
    return gapi.client.youtube.playlists.insert({
        part: 'snippet,status',
        resource: {
            snippet: {
                title: '新しい再生リスト ' + new Date().toLocaleString(),
                description: '自動作成された再生リスト'
            },
            status: {
                privacyStatus: 'private'
            }
        }
    }).then(function(response) {
        console.log('Playlist created:', response);
        const playlistId = response.result.id;
        return addVideoToPlaylist(playlistId, videoId);
    }).catch(function(error) {
        console.error('Error creating playlist:', error);
        alert('再生リストの作成に失敗しました: ' + error.result.error.message);
    });
}

function addVideoToPlaylist(playlistId, videoId) {
    return gapi.client.youtube.playlistItems.insert({
        part: 'snippet',
        resource: {
            snippet: {
                playlistId: playlistId,
                resourceId: {
                    kind: 'youtube#video',
                    videoId: videoId
                }
            }
        }
    }).then(function(response) {
        console.log('Video added to playlist:', response);
        alert('動画が新しい再生リストに追加されました！');
    }).catch(function(error) {
        console.error('Error adding video to playlist:', error);
        alert('動画の追加に失敗しました: ' + error.result.error.message);
    });
}

// APIクライアントのロード
handleClientLoad();
