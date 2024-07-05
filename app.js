// クライアントIDを設定します（Google Developers Consoleから取得）
const CLIENT_ID = '837106017981-ifl4tt9ijji70qn9oj0dngn8nlodtu9f.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAeLNPl20qikx_tzt2fOSuGIbCy-3VhKCE';

// 必要なスコープを設定
const SCOPES = 'https://www.googleapis.com/auth/youtube.force-ssl';

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPES
    }).then(function () {
        // 初期化成功
    }, function(error) {
        console.error('Error initializing the API client:', error);
    });
}

function saveToPlaylist() {
    const videoUrl = document.getElementById('videoUrl').value;
    const videoId = extractVideoId(videoUrl);

    if (!videoId) {
        alert('有効なYouTube動画URLを入力してください。');
        return;
    }

    gapi.auth2.getAuthInstance().signIn().then(function() {
        createPlaylist(videoId);
    });
}

function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function createPlaylist(videoId) {
    const request = gapi.client.youtube.playlists.insert({
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
    });

    request.execute(function(response) {
        const playlistId = response.id;
        addVideoToPlaylist(playlistId, videoId);
    });
}

function addVideoToPlaylist(playlistId, videoId) {
    const request = gapi.client.youtube.playlistItems.insert({
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
    });

    request.execute(function(response) {
        alert('動画が新しい再生リストに追加されました！');
    });
}

// APIクライアントのロード
handleClientLoad();
