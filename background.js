chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch (message.action) {
        case "getHTML":
            getHTML(message,sender,sendResponse);
            break;
        case "getJson":
            getJson(message,sender,sendResponse);
            break;
        case "postGas":
            postGas(message,sender,sendResponse);
            break;
        case "openOptionsPage":
            openOptionsPage();
            break;
        default:
            break;
    }
    return true;
});
//getHTML
function getHTML(message,sender,sendResponse){
    fetch(message.endpoint, {
        'method': 'GET',
        'cache': 'no-store'
    })
    .then(function (res) {
        return res.text();
    })
    .then(function (textData) {
        sendResponse(textData);
        console.log("get done.");
    })
    .catch(error => {
        console.log('エラーが発生しました');
        sendResponse("ERROR");
    });
}

//getJson
function getJson(message,sender,sendResponse){
    fetch(message.endpoint, {
        'method': 'GET',
        'cache': 'no-store'
    })
    .then(function (res) {
        return res.json(); // フェッチしたデータを JSON 形式に変換
    })
    .then(function (jsonData) {
        sendResponse(jsonData); // JSON へ変換されたデータを返す
        console.log("get done.");
    })
    .catch(error => {
        console.log('エラーが発生しました');
        sendResponse({
            "title":"connection failed",
            "reason":error,
            "error":true
        });
    });
}


//fetch gas
function postGas(message,sender,sendResponse){
    fetch("https://raw.githubusercontent.com/yudai1204/ec-assist/main/gasProfile.json", {
        'method': 'GET',
        'cache': 'no-store'
    })
    .then(function (res) {
        return res.json(); // フェッチしたデータを JSON 形式に変換
    })
    .then(function (jsonData) {
        chrome.storage.local.get({
            gasurl:""
        },function(items){
                const postparam =
                {
                    "method": "POST",
                    "Content-Type": "application/json",
                    "body": JSON.stringify({
                        "mode": "haru_download"})
                };
                fetch(items.gasurl || jsonData.gasurl, postparam)
                    .then(response => {
                        console.log(response);
                        return response.json();
                    })
                    .then(json => {
                        // レスポンス json の処理
                        console.log("OK");
                        console.log(json);
                        sendResponse(json);
                    })
        })
    })
}