//URLからGETパラメータを取得
let params = new URL(location.href).searchParams;
//オークタウンの画面だったら
if(location.href.includes("auctown.jp") && params.get("list") === "sold"){
    //CSS挿入
    document.head.insertAdjacentHTML("beforeEnd",`
        <style>
            .get-address,.auto-hyoka{
                border: 1px solid #d00;
                background: #f00;
                font-weight: bold;
                color: #fff;
            }
            
            .ajax-loading{
                background: #400;
                pointer-events: none;
                cursor: not-allowed !important;
            }
            .tableBody,.tableTd{
                border: 1px solid #000;
            }
            .tableBody{
                margin: 10px auto;
                padding: 2px;
                width: fit-content;
            }
            .tableTd{
                display: inline-block;
                margin: 2px 1px;
                padding: 2px;
                height: 100%;
            }
            .tableTd:nth-child(2n+1){
                width:140px;
            }
            .tableTd:nth-child(2n){
                width:500px;
            }
            .tableTr{
                margin: 2px;
            }
            #utlPopupWindow{
                width: 700px;
                height: 500px;
                z-index: 1000;
                position: fixed;
                background-color: #fff;
                left: 50%;
                top: 50%;
                transform: translate(-50%,-50%);
                padding-top: 20px;
                text-align: center;
                display: none;
            }
            #utlGrayLayer{
                position: fixed;
                background-color: #0006;
                width: 100%;
                height: 100%;
                left: 0;
                top: 0;
                z-index: 999;
                display: none;
            }
            .unvisibleForm{
                display:none !important;
            }
        </style>
    `);
    //レイヤー挿入
    document.body.insertAdjacentHTML('beforeend',`
    <div id="utlGrayLayer"></div>
    <div id="utlPopupWindow">
        <h2>現在選択されている注文情報</h2>
        <h3 id="orderTitle"></h3>
        <div class="popupTableArea">
            <div class="tableBody">
                <div class="tableTr">
                    <div class="tableTd">ヤフオク販売画像</div>
                    <div class="tableTd" id="orderYahooImg">loading</div>
                </div>
            </div>
            <div class="tableBody">
                <div class="tableTr">
                    <div class="tableTd">オークションID</div>
                    <div class="tableTd" id="auctionID">loading</div>
                </div>
                <div class="tableTr">
                    <div class="tableTd">郵便番号</div>
                    <div class="tableTd" id="orderPost">loading</div>
                </div>
                <div class="tableTr">
                    <div class="tableTd">住所</div>
                    <div class="tableTd" id="orderAddress">loading</div>
                </div>
                <div class="tableTr">
                    <div class="tableTd">名前</div>
                    <div class="tableTd" id="orderName">loading</div>
                </div>
            </div>
        </div>
    </div>
    `);
    //ボタン挿入
    const winnerCheck = setInterval(function() {
        if(document.getElementsByClassName("winnerSearching").length == 0){
            clearInterval(winnerCheck);
            //自動評価ボタン
            autoHyokaBtnSet();
            //ボタンを挿入
                const naviBtns = document.getElementsByClassName("button-sunny");
                const naviBtns2 = document.getElementsByClassName("sunny");
                for(const naviBtn of naviBtns){
                    naviBtn.insertAdjacentHTML("beforeBegin",`
                    <span>
                        <a class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only get-address" style="font-size: 11px;">
                            <span class="ui-button-text" style="padding: 0.2em 0.5em; font-weight: normal;">
                                住所取得
                            </span>
                        </a>
                    </span>
                    `);
                }
                for(const naviBtn of naviBtns2){
                    naviBtn.insertAdjacentHTML("beforeBegin",`
                    <span>
                        <a class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only get-address" style="font-size: 11px;">
                            <span class="ui-button-text" style="padding: 0.2em 0.5em; font-weight: normal;">
                                住所取得
                            </span>
                        </a>
                    </span>
                    `);
                }
            //ボタンをクリックしたときの挙動
            const getAddressBtns = document.getElementsByClassName("get-address");
            for(const getAddressBtn of getAddressBtns){
                getAddressBtn.addEventListener("click",function(){
                    //表示を変更
                    getAddressBtn.classList.add("ajax-loading");
                    getAddressBtn.innerHTML = `<span class="ui-button-text" style="padding: 0.2em 0.5em; font-weight: normal;">
                        取得中…
                    </span>`;
                    //URLを生成する
                    let urldata = getAddressBtn.parentNode.parentNode.getElementsByTagName("button")[1].getAttribute("onclick").slice(24);
                    const aid = urldata.slice(0,urldata.indexOf("'"));
                    urldata = urldata.slice(urldata.indexOf("'")+3);
                    const syid = urldata.slice(0,urldata.indexOf("'"));
                    urldata = urldata.slice(urldata.indexOf("'")+3);
                    const bid = urldata.slice(0,urldata.indexOf("'"));
                    const url = `https://contact.auctions.yahoo.co.jp/seller/top?aid=${aid}&syid=${syid}&bid=${bid}`;
                    //生成したURLからAjax
                    chrome.runtime.sendMessage(
                        {
                            action: 'getHTML',
                            endpoint: url
                        },
                        (response) => {
                            if(response.error){
                                //エラー時
                                alert("ERROR");
                                console.log(response);
                                return;
                            }else{
                                console.log("取得成功");
                                const parser = new DOMParser();
                                const ajaxhtml = parser.parseFromString(response, "text/html");
                                //住所等
                                let tradeData = {
                                    "aid": aid,
                                    "syid": syid,
                                    "id": aid+syid+bid
                                };
                                const tradeInfo = ajaxhtml.querySelector("#yjMain .acMdTradeInfo .decTableCnfBod .libTableCnf");
                                if(tradeInfo){
                                    tradeData.name = tradeInfo.querySelectorAll(".decCnfWr")[0].innerHTML.replace(/<br>|\n/g,' ');
                                    tradeData.address = tradeInfo.querySelectorAll(".decCnfWr")[1].innerHTML.slice(tradeInfo.querySelectorAll(".decCnfWr")[1].innerHTML.indexOf("<br>")+4).replace(/\n/g,' ');
                                    tradeData.postnum1 = tradeInfo.querySelectorAll(".decCnfWr")[1].innerHTML.slice(0,tradeInfo.querySelectorAll(".decCnfWr")[1].innerHTML.indexOf("<br>")).replace(/\n/g,' ').slice(1,4);
                                    tradeData.postnum2 = tradeInfo.querySelectorAll(".decCnfWr")[1].innerHTML.slice(0,tradeInfo.querySelectorAll(".decCnfWr")[1].innerHTML.indexOf("<br>")).replace(/\n/g,' ').slice(4);
                                    tradeData.delivery = (tradeInfo.querySelectorAll(".decCnfWr")[2].getElementsByTagName("img").length == 0)?tradeInfo.querySelectorAll(".decCnfWr")[2].innerHTML.replace(/<br>|\n| /g,''):tradeInfo.querySelectorAll(".decCnfWr")[2].childNodes[0].nodeValue.replace(/<br>|\n| /g,'') + tradeInfo.querySelectorAll(".decCnfWr")[2].childNodes[2].nodeValue.replace(/<br>|\n| /g,'');

                                    let address = tradeData.address.replace(/[０-９]/g, function(s) {
                                        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
                                    });
                                    //都道府県
                                    tradeData.prefecture = address.slice(0,address.indexOf(" "));
                                    address = address.slice(address.indexOf(" ")+1);
                                    //市町村
                                    tradeData.municipality = address.slice(0,address.indexOf(" "));
                                    address = address.slice(address.indexOf(" ")+1);
                                    //丁目・番地
                                    if(!address.includes(" ")){
                                        tradeData.choume = address;
                                    }else{
                                        tradeData.choume = address.slice(0,address.indexOf(" "));
                                        address = address.slice(address.indexOf(" ")+1);
                                        //アパート名
                                        tradeData.apart = address;
                                    }
                                }
                                //住所未入力だった場合
                                else if(ajaxhtml.querySelector("#yjMain .acMdTradeInfo .decTableCnfBod .decInTblCel .decNnEntTxt")){
                                    alert("住所情報が取得できません");
                                    getAddressBtn.classList.remove("ajax-loading");
                                    getAddressBtn.innerHTML = `
                                    <span class="ui-button-text" style="padding: 0.2em 0.5em; font-weight: normal;">
                                    住所取得
                                    </span>`
                                    return;
                                }
                                else{
                                    alert("ERROR");
                                    getAddressBtn.classList.remove("ajax-loading");
                                    getAddressBtn.innerHTML = `
                                    <span class="ui-button-text" style="padding: 0.2em 0.5em; font-weight: normal;">
                                    住所取得
                                    </span>`
                                    return;
                                }
                                //サムネ画像と商品名と金額取得
                                const itmImage = ajaxhtml.querySelector("#acConHeader .decItmPhoto img");
                                const itmName  = ajaxhtml.querySelector("#acConHeader .decItmName");
                                const itmPrice  = ajaxhtml.querySelector("#acConHeader .decPrice");
                                const endDate   = ajaxhtml.querySelector("#acConHeader .decMDT");
                                const itemNum   = ajaxhtml.querySelector("#acConHeader .decQunt");
                                if(itmImage && itmName) {
                                    tradeData.img = itmImage.getAttribute('src');
                                    tradeData.title = itmName.innerHTML.replace(/<br>|\n/g,' ');
                                    tradeData.price = itmPrice.innerHTML.slice(itmPrice.innerHTML.lastIndexOf("：")+2);
                                    tradeData.date  = endDate.innerHTML.slice(6);
                                    tradeData.itemNum = itemNum.innerHTML.slice(6);
                                }
                                console.log(tradeData);
                                //表示したデータをchrome.storageに保存
                                chrome.storage.local.get({
                                    tradeDataList: [],
                                    width: 640,
                                    height: 480
                                },function(items){
                                    let tradeDataList = items.tradeDataList;
                                    //同じIDの物があったら更新する
                                    let sameidFlag = false;
                                    for(let i = 0; i < tradeDataList.length; i++){
                                        if(tradeDataList[i].id === tradeData.id){
                                            sameidFlag = true;
                                            tradeDataList[i] = tradeData;
                                            break;
                                        }
                                    }
                                    if(sameidFlag === false){
                                        tradeDataList.push(tradeData);
                                    }
                                    //50件を超えたデータは削除する
                                    if(tradeDataList.length > 50){
                                        tradeDataList = tradeDataList.shift();
                                    }
                                    //保存
                                    chrome.storage.local.set({
                                        tradeDataList: tradeDataList,
                                        recentTrade: tradeData
                                    },function(){
                                        console.log("保存完了");
                                        console.log(tradeDataList);
                                        let tweetWindow = window.open( chrome.runtime.getURL("files/popupAuctown.html"), "確認", `width=${items.width}, height=${items.height}, innerWidth=${items.width}, innerHeight=${items.height}`);
                                    });
                                    //新規ウィンドウを開く
                                    /*
                                    document.getElementById("orderTitle").innerHTML = tradeData.title;
                                    document.getElementById("orderYahooImg").innerHTML = `<img src="${tradeData.img}" style="max-width:120px;">`;
                                    document.getElementById("auctionID").innerHTML = tradeData.aid;
                                    document.getElementById("orderPost").innerHTML = tradeData.postnum;
                                    document.getElementById("orderAddress").innerHTML = tradeData.address;
                                    document.getElementById("orderName").innerHTML = tradeData.name;
                                    
                                    document.getElementById("utlPopupWindow").style.display = "block";
                                    document.getElementById("utlGrayLayer").style.display = "block";
                                    document.getElementById("utlGrayLayer").addEventListener("click",function(){
                                        document.getElementById("utlPopupWindow").style.display = "none";
                                        document.getElementById("utlGrayLayer").style.display = "none";
                                    })
                                    */
                                    
                                });
                                //ボタンの表示を戻す
                                getAddressBtn.classList.remove("ajax-loading");
                                getAddressBtn.innerHTML = `
                                <span class="ui-button-text" style="padding: 0.2em 0.5em; font-weight: normal;">
                                住所取得
                                </span>`
                            }
                        }
                    );
                });
            }
        }
    },100);
    
}

if(location.href.includes("https://auctown.jp/MySelling/MySellingList/") || location.href.includes("auctown.jp/mySellingList") || location.href.includes("auctown.jp/myCloseList/") || location.href.includes("auctown.jp/goodsList/")){
    const resultTable = document.getElementById("resultTable");
    const pars = resultTable.querySelectorAll("tbody tr td:nth-child(1)");
    document.head.insertAdjacentHTML("beforeend",`
    <style>
    .asin-btn{
        display:block;
        background-color:#f3ca00;
        color:#000;
        border-radius:3px;
        width:fit-content;
        padding:2px 4px;
        margin: 2px auto;
        border:1px solid #bc9e00;
    }
    .sagaku{
        font-size:80%;
        display: block;
        padding:3px;
        border: 1px solid #ddd;
    }
    .akaji{
        color: red;
    }
    .checked-reason,.no-checked-reason,.skiped-reason,.noharu-reason{
        display: block;
        margin: 5px;
        border: 1px solid #ccc;
        color: #44f;
    }
    .checked-reason{
        color: #f00;
    }
    .skiped-reason{
        color: #aaa;
        font-size:80%;
    }
    .noharu-reason{
        color: #cca800;
    }
    </style>`)
    document.getElementById("stickyheader").insertAdjacentHTML("beforeEnd",`
        <a class="asin-btn" href="javascript:void(0);" id="asinCheckBtn">ASINチェック</a>
    `);
    document.getElementById("asinCheckBtn").addEventListener("click",function(){
        for(const par of pars){
            if(par.nextElementSibling){
                const aurl = par.nextElementSibling.nextElementSibling.querySelector("a").getAttribute("href");
                if(aurl.includes("javascript:")){
                    const aurl2 = "https://auctown.jp/newUploadNaviGoods/?kind=modify&goodsSeq="+aurl.replace("javascript:goodsRegmodifyLink(","").slice(0,-3);
                    console.log(aurl2);
                    //生成したURLからAjax
                    chrome.runtime.sendMessage(
                        {
                            action: 'getHTML',
                            endpoint: aurl2
                        },
                        (response) => {
                            if(response.error){
                                //エラー時
                                alert("ERROR");
                                console.log(response);
                                return;
                            }else{
                                console.log("取得成功");
                                const parser = new DOMParser();
                                const ajaxhtml = parser.parseFromString(response, "text/html");
                                if(ajaxhtml.getElementById("description_copy") && ajaxhtml.getElementById("description_copy").value.includes("店舗用商品ID:")){
                                    const asinData = caesarShift(ajaxhtml.getElementById("description_copy").value.slice(ajaxhtml.getElementById("description_copy").value.indexOf("店舗用商品ID:") + 8,ajaxhtml.getElementById("description_copy").value.indexOf("店舗用商品ID:") + 18), -2);
                                    par.insertAdjacentHTML("beforeend",`
                                    <div>
                                        <a href="https://www.amazon.co.jp/dp/${asinData}" class="asin-btn" target="_blank">${asinData}</a>
                                    </div>
                                    `);
                                }
                            }
                        }
                    );
                }else{
                    //生成したURLからAjax
                    chrome.runtime.sendMessage(
                        {
                            action: 'getHTML',
                            endpoint: aurl
                        },
                        (response) => {
                            if(response.error){
                                //エラー時
                                alert("ERROR");
                                console.log(response);
                                return;
                            }else{
                                console.log("取得成功");
                                const parser = new DOMParser();
                                const ajaxhtml = parser.parseFromString(response, "text/html");
                                const adoc = ajaxhtml.getElementById("adoc");
                                if(adoc.innerHTML.includes("店舗用商品ID:")){
                                    par.insertAdjacentHTML("beforeend",`
                                    <div>
                                        <a href="https://www.amazon.co.jp/dp/${caesarShift(adoc.innerHTML.slice(adoc.innerHTML.indexOf("店舗用商品ID:") + 8,adoc.innerHTML.indexOf("店舗用商品ID:") + 18), -2)}" class="asin-btn" target="_blank">${caesarShift(adoc.innerHTML.slice(adoc.innerHTML.indexOf("店舗用商品ID:") + 8,adoc.innerHTML.indexOf("店舗用商品ID:") + 18), -2)}</a>
                                    </div>
                                    `);
                                }
                            }
                        }
                    );
                }
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
        }
    });
}


if(location.href.includes("https://auctown.jp/MySelling/MySellingList/") || location.href.includes("auctown.jp/mySellingList")){
    document.getElementById("stickyheader").insertAdjacentHTML("beforeEnd",`
        <a class="asin-btn" href="javascript:void(0);" id="zaikoCheckBtn">在庫・価格・NG商品チェック</a>
    `);
    document.getElementById("zaikoCheckBtn").addEventListener("click", function() {
        document.getElementById("zaikoCheckBtn").innerHTML = "取得中…";
        chrome.runtime.sendMessage(
            {
                action: 'postGas',
            },
            (response) => {
                console.log(response);
                document.getElementById("zaikoCheckBtn").innerHTML = "在庫・価格・NG商品チェック";
                if (response.error) {
                    //エラー時
                    alert("エラー発生");
                    return;
                } else {
                    checkng(response);
                }
            }
        )
    });
}

function checkng(response){
    chrome.storage.local.get({
        aidDictionary: [/* aid | asin */]
    },function(items){
        const aidDictionary = items.aidDictionary;
        console.log(aidDictionary);
        const tbody = document.querySelector("#resultTable tbody");
        const aidRows = tbody.querySelectorAll("tr td:nth-child(1)");
        for(const aidRow of aidRows){
            //辞書にaidがあったら
            if(aidDictionary.flat().includes(aidRow.querySelector("label").innerHTML)){
                // console.log("辞書にaid発見");
                checkingNg( aidDictionary.flat()[aidDictionary.flat().indexOf(aidRow.querySelector("label").innerHTML)+1] , aidRow.parentNode.querySelector("td:nth-child(9) p:nth-child(1)").innerHTML.slice(0,-1) , aidRow);
            }else{//辞書にaidが無かったら
                console.log("aid新規追加");
                const url = aidRow.nextElementSibling.nextElementSibling.querySelector("a").getAttribute("href");
                //生成したURLからAjax
                chrome.runtime.sendMessage(
                    {
                        action: 'getHTML',
                        endpoint: url
                    },
                    (response) => {
                        if(response.error){
                            //エラー時
                            console.log("ERROR");
                            console.log(response);
                            return;
                        }else{
                            // console.log("取得成功");
                            const parser = new DOMParser();
                            const ajaxhtml = parser.parseFromString(response, "text/html");
                            if( ajaxhtml.getElementById("adoc").innerHTML.includes("店舗用商品ID:")){
                                const adoc = ajaxhtml.getElementById("adoc");
                                const asin = caesarShift(adoc.innerHTML.slice(adoc.innerHTML.indexOf("店舗用商品ID:") + 8,adoc.innerHTML.indexOf("店舗用商品ID:") + 18), -2);
                                checkingNg( asin , aidRow.parentNode.querySelector("td:nth-child(9) p:nth-child(1)").innerHTML.slice(0,-1) , aidRow );
                                if(aidDictionary.length > 5001){
                                    for(let i=5000; i<aidDictionary.length; i++){
                                        aidDictionary.shift();
                                    }
                                }
                                aidDictionary.push( [aidRow.querySelector("label").innerHTML, asin] );
                                chrome.storage.local.set({
                                    aidDictionary: aidDictionary
                                });
                            }else{
                                aidRow.insertAdjacentHTML( "beforeEnd",`<div class="skiped-reason">ASIN記載なし<br>(判定スキップ)</div>`);
                            }
                        }
                    }
                );
            }
        }
        console.log(response.ng.flat().filter( (elm,idx) =>  idx%2 === 0  ));
        alert("完了しました！");
        function checkingNg(asin,price,aidRow){
            price = price.replace(",","");
            const check = doCheck();
            if(check){
                console.log("発見");
                aidRow.querySelector(`input[type="checkbox"]`).checked = true;
                aidRow.insertAdjacentHTML("beforeEnd",check);
            }else{
                // console.log("大丈夫");
                if(!response.result.flat().filter( (elm,idx) =>  idx%5 === 0  ).includes(asin)){
                    aidRow.insertAdjacentHTML( "beforeEnd",`<div class="noharu-reason">Haru該当なし</div>`);
                }else{
                    aidRow.insertAdjacentHTML( "beforeEnd",`<div class="no-checked-reason">合格</div>`);
                }
            }
            function doCheck(){
                if(response.result.flat().filter( (elm,idx) =>  idx%5 === 0  ).includes(asin)){
                    console.log("checking");
                    const arr = response.result[response.result.flat().filter( (elm,idx) =>  idx%5 === 0  ).indexOf(asin)];
                    aidRow.parentNode.querySelector("td:nth-child(9)").insertAdjacentHTML("beforeEnd",`
                    <p class="sagaku ${(Number(price)*0.91 - Number(arr[2]) < 0)?"akaji":""}">Amazon差額:<br>￥ ${Math.floor(Number(price)*0.91 - Number(arr[2]))}</p>
                    `);
                    console.log(arr);
                    aidRow.parentNode.querySelector("td:nth-child(10)").insertAdjacentHTML("beforeEnd",`
                    <p class="sagaku">Haru更新:<br>${arr[4]}</p>
                    `);
                    //ngワードチェック
                    if(response.ng[0][0] !== ""){
                        for(const ngword of response.ng.flat().filter( (elm,idx) =>  idx%2 === 0  )){
                            console.log(arr[1]);
                            if(arr[1].includes(ngword)){
                                return `<div class="checked-reason">NGワード(Amz商品名)</div>`;
                            }
                        }
                    }
                    //在庫チェック
                    if(Number(arr[3]) == 0){
                        return `<div class="checked-reason">在庫なし</div>`;
                    }
                    //価格チェック
                    if(arr[2] == "" || Number(price)*0.91 < Number(arr[2]) ){
                        return `<div class="checked-reason">赤字(Amz商品名)</div>`;
                    }
                }else{
                    console.log("skip");
                }
                //ngasinチェック
                if(response.ng[0][1] !== "" && response.ng.flat().filter( (elm,idx) =>  idx%2 === 1  ).includes(asin)){
                    return `<div class="checked-reason">NG ASIN</div>`;
                }
                //ngワードチェック
                if(response.ng[0][0] !== ""){
                    for(const ngword of response.ng.flat().filter( (elm,idx) =>  idx%2 === 0  )){
                        if(aidRow.nextElementSibling.nextElementSibling.querySelector("a").innerHTML.includes(ngword)){
                            return `<div class="checked-reason">NGワード(出品名)</div>`;
                        }
                    }
                }
                return false;
            }
        }
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
}



function getPopupAsin() {
    if (location.href.includes("https://auctown.jp/MySelling/MySellingList/") || location.href.includes("auctown.jp/mySellingList")) {
        if(!document.querySelector("#resultTable tbody")){
            return null;
        }
        const data = [];
        for(const href of document.querySelectorAll("#resultTable tbody tr td:nth-child(3) a")){
            data.push(href.getAttribute("href"));
        }
        console.log(data);
        return data;
    }else if(location.href.includes("https://auctown.jp/goodsList/")){
        const resultTable = document.getElementById("resultTable");
        const pars = resultTable.querySelectorAll("tbody tr td:nth-child(1)");
        const data = [];
        for(const par of pars){
            if(par.nextElementSibling){
                const aurl = par.nextElementSibling.nextElementSibling.querySelector("a").getAttribute("href");
                const aurl2 = "https://auctown.jp/newUploadNaviGoods/?kind=modify&goodsSeq="+aurl.replace("javascript:goodsRegmodifyLink(","").slice(0,-3);
                data.push(aurl2);
            }else{
                return null;
            }
        }
        return data;
    }else{
        return null;
    }
}


// popupからのメッセージを受け取る
chrome.runtime.onMessage.addListener((send_data, sender, callback) => {
    //何かしらの処理
    if(send_data === "getPopupAsin"){
        // コールバック関数の実行
        callback(getPopupAsin());
    }
    return true;
});