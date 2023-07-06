chrome.storage.local.get({
    recentTrade: null
}, function (items) {
    const tradeData = items.recentTrade;
    document.getElementById("orderTitle").insertAdjacentHTML("afterBegin", tradeData.title);
    document.getElementById("orderYahooImg").innerHTML = `<img src="${tradeData.img}" style="max-width:120px;">`;
    document.getElementById("auctionID").innerHTML = tradeData.aid;
    document.getElementById("orderPost").innerHTML = "〒"+tradeData.postnum1 + "-" + tradeData.postnum2;
    document.getElementById("orderAddress").innerHTML = tradeData.address;
    document.getElementById("orderName").innerHTML = tradeData.name;
    document.getElementById("delivery").innerHTML = tradeData.delivery;
    document.getElementById("price").innerHTML = tradeData.price;
    //コピー部分
    document.querySelector("#orderTitle button").addEventListener("click", function () {
        setClipboard(tradeData.title, "text/plain");
    });
    document.getElementById("copyAmzn").addEventListener("click", function () {
        setClipboard(JSON.stringify(tradeData), "text/plain");
    });
    
    //asin取得
    chrome.runtime.sendMessage(
        {
            action: 'getHTML',
            endpoint: "https://page.auctions.yahoo.co.jp/jp/auction/" + tradeData.aid
        },
        (response) => {
            let asin = "";
            if (response.error) {
                //エラー時
                alert("ERROR");
                console.log(response);
                return;
            } else {
                console.log("取得成功");
                const parser = new DOMParser();
                const ajaxhtml = parser.parseFromString(response, "text/html");
                const adoc = ajaxhtml.getElementById("adoc");
                if (adoc && adoc.innerHTML.includes("店舗用商品ID:")) {
                    asin = caesarShift(adoc.innerHTML.slice(adoc.innerHTML.indexOf("店舗用商品ID:") + 8,adoc.innerHTML.indexOf("店舗用商品ID:") + 18), -2);
                    document.getElementById("asin").innerHTML = `<a href="https://www.amazon.co.jp/dp/${asin}" target="_blank" rel="noopener noreferrer">${asin}</a>`;
                }else{
                    document.getElementById("asin").innerHTML = "NO DATA";
                }
            }
            //スプシコピペ
            const datenum = 44743 + Math.floor((new Date(tradeData.date.replace(/年|月/g,"/").replace(/日|分/g,"").replace(/時/g,":")).getTime()-new Date("2022-7-1 00:00 JST").getTime())/(1000*60*60*24));
            document.getElementById("copySpread").addEventListener("click",function(){
                setClipboard(`<google-sheets-html-origin
                style="color: rgb(0, 0, 0); font-size: medium; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;">
                <table xmlns="http://www.w3.org/1999/xhtml" cellspacing="0" cellpadding="0" dir="ltr" border="1"
                    style="table-layout: fixed; font-size: 10pt; font-family: Arial; width: 0px; border-collapse: collapse; border: none;">
                    <colgroup>
                        <col width="100">
                        <col width="100">
                        <col width="100">
                        <col width="100">
                        <col width="100">
                        <col width="100">
                        <col width="100">
                        <col width="100">
                    </colgroup>
                    <tbody>
                        <tr style="height: 21px;">
                            <td data-sheets-value="{&quot;1&quot;:2,&quot;2&quot;:&quot;${tradeData.syid}&quot;}"
                                style="border: 1px solid rgb(0, 0, 0); overflow: hidden; padding: 2px 3px; vertical-align: bottom;">
                                ${tradeData.syid}</td>
                            <td data-sheets-value="{&quot;1&quot;:2,&quot;2&quot;:&quot;${tradeData.aid}&quot;}"
                                style="border-width: 1px; border-style: solid; border-color: rgb(0, 0, 0) rgb(0, 0, 0) rgb(0, 0, 0) rgb(204, 204, 204); border-image: initial; overflow: hidden; padding: 2px 3px; vertical-align: bottom;">
                                ${tradeData.aid}</td>
                            <td data-sheets-value="{&quot;1&quot;:3,&quot;3&quot;:${datenum}}"
                                data-sheets-numberformat="{&quot;1&quot;:5,&quot;2&quot;:&quot;m/d&quot;,&quot;3&quot;:1}"
                                style="border-width: 1px; border-style: solid; border-color: rgb(0, 0, 0) rgb(0, 0, 0) rgb(0, 0, 0) rgb(204, 204, 204); border-image: initial; overflow: hidden; padding: 2px 3px; vertical-align: bottom; text-align: right;">
                                ${tradeData.date}</td>
                            <td data-sheets-value="{&quot;1&quot;:2,&quot;2&quot;:&quot;${tradeData.name}&quot;}"
                                style="border-width: 1px; border-style: solid; border-color: rgb(0, 0, 0) rgb(0, 0, 0) rgb(0, 0, 0) rgb(204, 204, 204); border-image: initial; overflow: hidden; padding: 2px 3px; vertical-align: bottom;">
                                ${tradeData.name}</td>
                            <td data-sheets-value="{&quot;1&quot;:2,&quot;2&quot;:&quot;${asin}&quot;}"
                                style="border-width: 1px; border-style: solid; border-color: rgb(0, 0, 0) rgb(0, 0, 0) rgb(0, 0, 0) rgb(204, 204, 204); border-image: initial; overflow: hidden; padding: 2px 3px; vertical-align: bottom; font-family: Arial; font-size: 12pt; font-weight: normal;">
                                ${asin}</td>
                            <td data-sheets-value="{&quot;1&quot;:2,&quot;2&quot;:&quot;${tradeData.title}&quot;}"
                                style="border-width: 1px; border-style: solid; border-color: rgb(0, 0, 0) rgb(0, 0, 0) rgb(0, 0, 0) rgb(204, 204, 204); border-image: initial; overflow: hidden; padding: 2px 3px; vertical-align: bottom; font-family: Arial; font-size: 12pt; font-weight: normal;">
                                ${tradeData.title}</td>
                            <td data-sheets-value="{&quot;1&quot;:3,&quot;3&quot;:${tradeData.itemNum}}"
                                style="border-width: 1px; border-style: solid; border-color: rgb(0, 0, 0) rgb(0, 0, 0) rgb(0, 0, 0) rgb(204, 204, 204); border-image: initial; overflow: hidden; padding: 2px 3px; vertical-align: bottom; background-color: rgb(244, 204, 204); font-size: 11pt; text-decoration: underline; text-align: center;">
                                ${tradeData.itemNum}</td>
                            <td data-sheets-value="{&quot;1&quot;:3,&quot;3&quot;:${tradeData.price}}"
                                data-sheets-numberformat="{&quot;1&quot;:2,&quot;2&quot;:&quot;#,##0&quot;,&quot;3&quot;:1}"
                                style="border-width: 1px; border-style: solid; border-color: rgb(0, 0, 0) rgb(0, 0, 0) rgb(0, 0, 0) rgb(204, 204, 204); border-image: initial; overflow: hidden; padding: 2px 3px; vertical-align: bottom; font-family: Arial; font-size: 12pt; font-weight: normal; text-align: right;">
                                ${tradeData.price.toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
            </google-sheets-html-origin>`,"text/html");
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
        });
})

function setClipboard(data, type) {
    const blob = new Blob([data], { type });
    const cdata = [new ClipboardItem({ [type]: blob })];
    navigator.clipboard.write(cdata).then(
        function () {
            console.log("success");
            document.getElementById("result").innerHTML = "コピーしました";
            document.getElementById("result").classList.add("copied");
            setTimeout(function () {
                document.getElementById("result").innerHTML = "";
                document.getElementById("result").classList.remove("copied");
            }, 1000);
        },
        function () {
            console.log("failure");
            alert("Error:クリップボードへのアクセスを許可してください");
        })
}

