// contentにメッセージを送る
chrome.tabs.query({ active: true, currentWindow: true }, aim_message);

function aim_message(tabs) {
    let send_data = "getPopupAsin";
    // 今開いているタブに、データを渡す（send_data, callbackは省略可）
    chrome.tabs.sendMessage(tabs[0].id, send_data, callback);
}

function callback(callback_data) {
    console.log(callback_data);
    // コールバック関数の処理（popupからの値をlocalstorageに保存したり）
    if(callback_data === null){
        document.getElementById("result").value = "取得できませんでした";
        return;
    }
    let textdata ="";
    document.getElementById("result").value = "取得中...";
    //保存されているものはとりだす
    //されていないものは通信
    chrome.storage.local.get({
        aidDictionary: [/* aid | asin */]
    },function(items){
        const aidDictionary = items.aidDictionary;
        let cnt=0;
        for(const aurl of callback_data){
            const aid = aurl.replace("https://page.auctions.yahoo.co.jp/jp/auction/","");
            //もし辞書にaidがあったら
            if(aidDictionary.flat().includes(aid)){
                console.log("辞書");
                textdata += aidDictionary.flat()[aidDictionary.flat().indexOf(aid)+1] + "\n";
                cnt++;
                if(cnt == callback_data.length){
                    textdata = textdata.slice(0,-1);
                    document.getElementById("result").value = textdata;
                }
            }else{
                console.log("新規");
                //生成したURLからAjax
                chrome.runtime.sendMessage(
                    {
                        action: 'getHTML',
                        endpoint: aurl
                    },
                    (response) => {
                        if(response.error){
                            //エラー時
                            console.log("ERROR");
                            console.log(response);
                            return;
                        }else{
                            const parser = new DOMParser();
                            const ajaxhtml = parser.parseFromString(response, "text/html");
                            cnt++;
                            const adoc = ajaxhtml.getElementById("adoc");
                            if( adoc && ajaxhtml.getElementById("adoc").innerHTML.includes("店舗用商品ID:")){
                                const asin = caesarShift(adoc.innerHTML.slice(adoc.innerHTML.indexOf("店舗用商品ID:") + 8,adoc.innerHTML.indexOf("店舗用商品ID:") + 18), -2);
                                textdata += asin + "\n";
                                if(aidDictionary.length > 5001){
                                    for(let i=5000; i<aidDictionary.length; i++){
                                        aidDictionary.shift();
                                    }
                                }
                                aidDictionary.push( [aid, asin] );
                                chrome.storage.local.set({
                                    aidDictionary: aidDictionary
                                });
                            }else if(ajaxhtml.getElementById("description_copy") && ajaxhtml.getElementById("description_copy").value.includes("店舗用商品ID:")){
                                    const asin = caesarShift(ajaxhtml.getElementById("description_copy").value.slice(ajaxhtml.getElementById("description_copy").value.indexOf("店舗用商品ID:") + 8,ajaxhtml.getElementById("description_copy").value.indexOf("店舗用商品ID:") + 18), -2);
                                    textdata += asin + "\n";
                            }
                            if(cnt == callback_data.length){
                                textdata = textdata.slice(0,-1);
                                document.getElementById("result").value = textdata;
                            }
                        }
                    }
                );
            }
        }    
    });
    //コピーしたとき
    document.getElementById("copyID").addEventListener("click",function(){
        setClipboard2(textdata,"text/plain");
        document.getElementById("log").style.display = "block";
        setTimeout(function(){
            document.getElementById("log").style.display = "none";
        },1000);
    });
    function caesarShift(str, shift) {
        // Output value
        let output = '';
        if (str == null || str == "") {
            return "Input string is empyt or something wrong!"
        }
        // Go through each character in this loops
        for (let i = 0; i < str.length; i++) {
            // Get the character
            let c = str[i];
            // If the character is a letter...
            if (c.match(/[a-z]/i)) {
                let code = str.charCodeAt(i);
                // A to Z
                if ((code >= 65) && (code <= 90)) {
                    let t = code - 65 + shift
                    if (t < 0) {
                        t = 26 - Math.abs(t) % 26
                    }
                    c = String.fromCharCode((t % 26) + 65);
                }
                // a to z
                else if ((code >= 97) && (code <= 122)) {
                    let t = code - 97 + shift
                    if (t < 0) {
                        t = 26 - Math.abs(t) % 26
                    }
                    c = String.fromCharCode((t % 26) + 97);
                }
            }
            // 0 - 9
            else if (c.match(/[0-9]/)) {
                let code = str.charCodeAt(i);
                let t = code - 48 + shift
                if (t < 0) {
                    t = 10 - Math.abs(t) % 10
                }
                c = String.fromCharCode((t % 10) + 48);
            }
            // Append
            output += c;
        }
        // Return the output value!
        return output;
    }
}






function setClipboard2(data,type){
    const blob = new Blob([data],{type});
    const cdata = [new ClipboardItem({[type]: blob})];
    navigator.clipboard.write(cdata).then(
        function(){
            console.log("success");
            document.getElementById("result").innerHTML = "コピーしました";
            document.getElementById("result").classList.add("copied");
            setTimeout(function(){
                document.getElementById("result").innerHTML = "";
                document.getElementById("result").classList.remove("copied");
            },1000);
        },
        function(){
            console.log("failure");
            alert("Error:クリップボードへのアクセスを許可してください");
        })
}

document.getElementById("gotoOption").addEventListener("click",function(){
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }
})