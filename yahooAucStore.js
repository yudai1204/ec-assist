if (location.href.includes("https://auctions.store.yahoo.co.jp/serinavi/items")) {
    //loadしたらajax確認して挿入
    function insertCheckByCsvBtn() {
        // loadingマーク出てたら飛ばす
        if (document.getElementsByTagName("body")[0].querySelectorAll(".sc-iyvyFf.cYcfXl").length > 0) {
            console.log("extension skipped because of loading...");
            setTimeout(() => { insertCheckByCsvBtn(); }, 500);
            return;
        }
        // 挿入
        console.log("nowInsert");
        if (document.getElementsByTagName("body")[0].querySelectorAll(".sc-eNQAEJ.gPIhZp").length == 0) {
            return;
        }
        document.getElementsByTagName("body")[0].querySelector(".sc-eNQAEJ.gPIhZp").insertAdjacentHTML("afterend", `
            <style>
            #ecassist-check-panel{
                margin-bottom: 10px;
                margin-top: 10px;
                background-color: #fff;
                border: 2px solid #ccc;
                border-radius: 5px;
                padding: 5px;
                color: #000;
            }
            #ecassist-check-panel > h2{
                font-weight: bold;
                font-size: 110%;
            }
            </style>
            <div id="ecassist-check-panel">
            <h2>EC-Assist Menu</h2>
                <div style="margin-bottom:5px">
                    Haru CSVアップロード: <input id="ecassist-haru-upload" type="file" accept=".csv">
                </div>
                <div>
                    <button disabled id="ecassist-zaikogire-btn">在庫切れ抽出</button>
                    <button disabled id="ecassist-akaji-btn">赤字商品抽出(未実装)</button>
                </div>
            </div>
            `);
        let csvArray = [];
        let asinArray = [];
        document.getElementById("ecassist-haru-upload").addEventListener("change", function () {
            if (document.getElementById("ecassist-haru-upload").files.length !== 1) {
                console.log("No file selected");
                return;
            }
            let fileReader = new FileReader();
            fileReader.readAsText(document.getElementById("ecassist-haru-upload").files[0], "Shift-JIS");
            fileReader.onload = () => {
                let fileResult = fileReader.result.split('\n');
                // 先頭行をヘッダとして格納
                let header = fileResult[0].slice(1, -1).split('","');
                console.log(header);
                // 先頭行の削除
                fileResult.shift();
                // CSVから情報を取得
                csvArray = fileResult.map(item => {
                    let datas = item.split('","');
                    datas[0] = datas[0].slice(1);
                    datas[datas.length - 1] = datas[datas.length - 1].slice(0, -1);
                    let result = {};
                    for (const index in datas) {
                        let key = header[index];
                        result[key] = datas[index];
                    }
                    return result;
                });
                asinArray = csvArray.map(x => x.ASINコード);
                console.log(asinArray);
                console.log(csvArray);
                if (asinArray[0] == undefined) {
                    alert('Error: HARU形式変更');
                    return;
                }
                alert("CSVを読み込みました");
                document.getElementById("ecassist-zaikogire-btn").disabled = false;
                document.getElementById("ecassist-akaji-btn").disabled = false;
            }
        });
        document.getElementById("ecassist-akaji-btn").addEventListener("click", () => {
            if (confirm("赤字抽出を開始しますか？")) {
                if (csvArray.length < 2) {
                    alert("Error: CSVデータが不正です");
                    return;
                }
                //log areaを用意
                document.body.insertAdjacentHTML("beforeend", `
                    <style>
                    #ecassist-overlay{
                        display: block;
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: #0005;
                        z-index: 1000;
                    }
                    #ecassist-overlay > div{
                        width:50%;
                        height: 40vh;
                        margin-top: 30vh;
                        margin-left: 15vw;
                        background-color: #fff;
                    }
                    </style>
                    <div id="ecassist-overlay">
                        <div>
                            <h2>データを取得中です…</h2>
                            <span id="ecassist-message-area"></span>
                        </div>
                    </div>
                    `)
                //メインroutineに移行
                getMain(asinArray, csvArray, 1);
            }
        });
        document.getElementById("ecassist-zaikogire-btn").addEventListener("click", () => {
            if (confirm("在庫切れ抽出を開始しますか？")) {
                if (csvArray.length < 2) {
                    alert("Error: CSVデータが不正です");
                    return;
                }
                //log areaを用意
                document.body.insertAdjacentHTML("beforeend", `
                    <style>
                    #ecassist-overlay{
                        display: block;
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: #0005;
                        z-index: 1000;
                    }
                    #ecassist-overlay > div{
                        width:50%;
                        height: 40vh;
                        margin-top: 30vh;
                        margin-left: 15vw;
                        background-color: #fff;
                    }
                    </style>
                    <div id="ecassist-overlay">
                        <div>
                            <h2>データを取得中です…</h2>
                            <span id="ecassist-message-area"></span>
                        </div>
                    </div>
                    `)
                //メインroutineに移行
                getMain(asinArray, csvArray, 0);
            }
        });
    }
    window.addEventListener('load', () => {
        insertCheckByCsvBtn();
    });

    //メイン
    let logcsv = `"抽出ASIN","適正ASIN(1:適正 0:不適正)","HARU該当(1: 該当あり 0: 該当なし)","HARU在庫アラート","HARU Amazon最新価格","ヤフオク出品価格","収支(マイナスで赤字)"\n`;
    function getMain(asinArray, csvArray, domode) {
        chrome.storage.local.get({
            yahooAucIntervalTime: 3000
        }, function (storageItems) {
            if (document.getElementsByTagName("body")[0].querySelectorAll(".sc-iyvyFf.cYcfXl").length > 0) {
                console.log("extension skipped because of loading");
                setTimeout(() => { getMain(asinArray, csvArray, domode); }, storageItems.yahooAucIntervalTime);
                return;
            }
            const table = document.getElementsByTagName("body")[0].querySelector(".sc-gGBfsJ.fJAnmE");
            if (!table) {
                alert("Error: notable");
                return;
            }
            //進捗表示
            document.getElementById("ecassist-message-area").innerHTML = "進捗: " + Math.floor(Number(document.getElementsByTagName("body")[0].querySelector(".sc-jAaTju.jLLxbV").childNodes[0].nodeValue.replace(/,/g, "")) / Number(document.getElementsByTagName("body")[0].querySelector(".sc-cMljjf.kSOPKl").innerHTML.replace(/,/g, "")) * 100) + "%";
            //tableから行データを抜き出す
            for (const ul of table.querySelectorAll(".sc-jnlKLf.gfROy")) {
                const kanriNode = ul.querySelectorAll(".sc-iRbamj.iuYzBP")[3].querySelector(".sc-itybZL.VSKgB");
                const kakakuNode = (ul.querySelectorAll(".sc-iRbamj.iuYzBP")[4].querySelector(".sc-dTdPqK.drzZzm")) ?
                    ul.querySelectorAll(".sc-iRbamj.iuYzBP")[4].querySelector(".sc-dTdPqK.drzZzm").parentNode :
                    ul.querySelectorAll(".sc-iRbamj.iuYzBP")[4].querySelector(".sc-bHwgHz.ePnYhO");
                if (kanriNode) {
                    const asin = kanriNode.innerHTML.slice(-10);
                    console.log(asin);
                    console.log("価格 > " + kakakuNode.innerHTML.replace(/[^0-9]/g, ""));
                    //asinチェック
                    if (asin && asin.length === 10 && /^[A-Z0-9]*$/.test(asin)) {
                        console.log("正しいASIN");
                    } else {
                        console.log("不正なASIN");
                        logcsv += `"${asin}","0","","","","",""\n`;
                        continue;
                    }
                    const asinContainNum = asinArray.indexOf(asin);
                    if (asinContainNum < 0) {
                        //見つからなかった場合
                        console.log("> 該当なし");
                        logcsv += `"${asin}","1","0","","","",""\n`;
                    } else {
                        console.log("> " + csvArray[asinContainNum]["ASINコード"]);
                        console.log("> " + csvArray[asinContainNum]["在庫ワード-アラート(0:アラート or 1:なし)"]);
                        logcsv += `"${asin}","1","1","${csvArray[asinContainNum]["在庫ワード-アラート(0:アラート or 1:なし)"]}","${csvArray[asinContainNum]["Amazon最新価格1"]}","${kakakuNode.innerHTML.replace(/[^0-9]/g, "")}","${Number(kakakuNode.innerHTML.replace(/[^0-9]/g, "")) * 0.9 - Number(csvArray[asinContainNum]["Amazon最新価格1"])}"\n`;

                        if (domode == 0 && csvArray[asinContainNum]["在庫ワード-アラート(0:アラート or 1:なし)"] == "0") {
                            //在庫なかったらcheck
                            ul.querySelector('.sc-kkGfuU.JBWYT').click();
                        } else if (domode == 1 && Number(kakakuNode.innerHTML.replace(/[^0-9]/g, "")) * 0.9 - Number(csvArray[asinContainNum]["Amazon最新価格1"]) <= 0) {
                            //赤字だったらcheck
                            ul.querySelector('.sc-kkGfuU.JBWYT').click();
                        }
                    }
                }
            }
            //次ボタンを押す
            if (document.getElementsByTagName("body")[0].querySelectorAll(".sc-jDwBTQ.fDtmjj").length > 0) {
                document.getElementsByTagName("body")[0].querySelector(".sc-jDwBTQ.fDtmjj").click();
                setTimeout(() => { getMain(asinArray, csvArray, domode); }, storageItems.yahooAucIntervalTime);
            } else {
                //CSVのバイナリデータを作る
                let blob = new Blob([new Uint8Array(Encoding.convert(Encoding.stringToCode(logcsv), 'sjis', 'unicode'))], { type: "text/csv" });
                let uri = URL.createObjectURL(blob);
                // ダウンロードリンクを 生成
                let dlLink = document.createElement("a");
                // blob から URL を生成
                dlLink.href = uri;
                dlLink.download = `yahooAuctionLog-${new Date().getFullYear()}_${new Date().getMonth() + 1}_${new Date().getDate()}-${new Date().getHours()}_${new Date().getMinutes()}.csv`;
                // 設置/クリック/削除
                document.body.insertAdjacentElement("beforeEnd", dlLink);
                dlLink.click();
                dlLink.remove();
                // オブジェクト URL の開放
                setTimeout(function () {
                    window.URL.revokeObjectURL(uri);
                }, 1000);
                document.getElementById("ecassist-message-area").innerHTML = '<strong>取得完了しました。</strong><button id="ecassist-closeModal">閉じる</button>';
                document.getElementById("ecassist-closeModal").addEventListener("click", function () {
                    document.getElementById("ecassist-overlay").style.display = 'none';
                })
            }
        });
    }
}

//ストアクリエイタープロ 住所コピー
if (location.href.startsWith("https://pro.store.yahoo.co.jp/") && location.href.includes("order/manage/detail")) {
    const ordererData = [...document.querySelectorAll("form > div > div > .ReceAdd > table > tbody > tr")].map(x => { return { key: x.querySelector("th")?.innerText, val: x.querySelector("td")?.innerText } });
    document.querySelector("form > div > div > .ReceAdd > table > tbody").insertAdjacentHTML("afterbegin", `
    <style>
    #ecassist-copy-btn{
        display: block;
        background-color: #ffcc00;
        color: #000;
        border-radius: 5px;
        padding: 5px;
        box-shadow: 0 0 5px #0005;
        margin: 5px;
        text-align: center;
    }
    #ecassist-copy-btn:hover{
        cursor: pointer;
        background-color: #ffdd00;
    }
    </style>
    <tr>
        <div id="ecassist-copy-btn">拡張機能にコピー</div>
    </tr>
    `);
    console.log(ordererData);
    document.getElementById("ecassist-copy-btn").addEventListener("click", function () {
        const copyData = {};
        ordererData.forEach(x => {
            switch (x.key.trim()) {
                case "氏名":
                    copyData["name"] = x.val;
                    break;
                case "郵便番号":
                    copyData["postnum1"] = x.val.trim().slice(0, 3);
                    copyData["postnum2"] = x.val.trim().slice(-4);
                    break;
                case "住所":
                    copyData["address"] = x.val.trim();
                    copyData["prefacture"] = x.val.trim().replace(/^(.{2}[都道府県]|.{3}県)(.+)/, "$1 $2").split(' ')[0];
                    copyData["municipality"] = x.val.trim().replace(/^(.{2}[都道府県]|.{3}県)(.+)/, "$1 $2").split(' ')[1];
                    break;
                case "電話番号":
                    copyData["tel"] = x.val.replace(/[^0-9]/g,"");
                    break;
                default:
                    break;
            }
        });
        copyData["choume"] = "";
        copyData["apart"] = "";
        chrome.runtime.sendMessage({ action: "getJson", endpoint: "https://zipcloud.ibsnet.co.jp/api/search?zipcode=" + copyData["postnum1"] + copyData["postnum2"] }, function (response) {
            if (response.status == 200) {
                copyData["choume"] = copyData.municipality.replace(response.results[0].address2, "");
                copyData["municipality"] = response.results[0].address2;
            }
            console.log(copyData);
            // copy to clicpboard
            navigator.clipboard.writeText(JSON.stringify(copyData)).then(
                () => { alert("コピーしました") },
                () => { alert("コピーに失敗しました") }
            );
        });
    });
}