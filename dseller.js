if (location.href.includes("dseller.net/accounts") && location.href.includes("/product")) {
    const refreshIcon = document.getElementsByClassName("fa-refresh");
    const interval = setInterval(function() {
        if (refreshIcon.length == 0) {
            clearInterval(interval);
            insertDialog();
            insertStyle();
            const btnArea = document.getElementsByClassName("col-md-8")[0];
            btnArea.firstElementChild.style.visibility = "hidden";
            btnArea.insertAdjacentHTML("beforeEnd", `
            <button id="exportAuctownBtn" class="pull-right btn btn-success btn-sm">オークタウン・ヤフオクストア形式出力</button>
            <button id="changeBtns" class="pull-right btn btn-primary btn-sm">表示切替</button>
            `);
            const exportAuctownBtn = document.getElementById("exportAuctownBtn");
            const changeBtns = document.getElementById('changeBtns');
            let btnMode = 0;
            //表示切替クリック時
            changeBtns.addEventListener("click", function() {
                if (btnMode == 0) {
                    exportAuctownBtn.style.visibility = "hidden";
                    btnArea.firstElementChild.style.visibility = "visible";
                    btnMode = 1;
                } else {
                    exportAuctownBtn.style.visibility = "visible";
                    btnArea.firstElementChild.style.visibility = "hidden";
                    btnMode = 0;
                }
            });
            openGetDialog();
            document.getElementById("auctownGetStart").addEventListener("click", function(){ getStarting("auctown"); } );
            document.getElementById("yahooStoreGetStart").addEventListener("click", function(){ getStarting("yahooAuctionStore"); } );
            function getStarting(csvOutputMode){
                const generalData = {
                    num: document.getElementById("auctownKosuu").value,
                    holdingPeriod: document.getElementById("auctownKaisaikikan").value,
                    prefecture: document.getElementById("auctownTodofuken").value,
                    postage: document.getElementById("auctownSoryo").value,
                    paymentTiming: document.getElementById("auctownDaikin").value,
                    yahooSettlement: document.getElementById("auctownDaikin").value,
                    daibiki: document.getElementById("auctownDaibiki").value,
                    state: document.getElementById("shohinJotai").value,
                    returnable: document.getElementById("auctownHenpin").value,
                    auctownNyusatsuHyokaSegen: document.getElementById("auctownNyusatsuHyokaSegen").value,
                    auctownWaruiHyokaSegen: document.getElementById("auctownWaruiHyokaSegen").value,
                    auctownNinshoSegen: document.getElementById("auctownNinshoSegen").value,
                    auctownSaishuppin: document.getElementById("auctownSaishuppin").value,
                    auctownNisuu: document.getElementById("auctownNisuu").value,
                    auctownHaiso: document.getElementById("auctownHaiso").value,
                    haisouGroup: document.getElementById("haisouGroup").value,
                    folder: document.getElementById("folder").value,
                    hassoudate: document.getElementById("hassoudate").value
                };
                const now = new Date();
                if (confirm("取得を開始しますか？")) {
                    const auctownDialog = document.getElementById('auctownDialog');
                    const auctownLayer = document.getElementById('auctownLayer');
                    auctownDialog.innerHTML = `
                        <h3>取得中<span id="gettingData"></span></h3>
                        <div class="gettingData">
                            <p>取得状況: <span id="nowGettingData"></span></p>
                            <textarea id="auctownLog"></textarea>
                        </div>
                    `;
                    const logArea = document.getElementById("auctownLog");
                    logArea.value += `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} > 取得を開始しました\n`;
                    auctownDialog.classList.add("displayForce");
                    auctownLayer.classList.add("displayForce");
                    let n = 0;
                    const loadingInterval = setInterval(function() {
                        let loadingStr = "";
                        for (let i = 0; i < n % 4; i++) {
                            loadingStr += ".";
                        }
                        document.getElementById("gettingData").innerHTML = loadingStr;
                        n++;
                    }, 500);
                    //CSV読み込み
                    logArea.value += `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} > カテゴリデータベース展開中\n`;
                    document.getElementById("nowGettingData").innerHTML = "ファイル展開中";

                    function getCSV(filename) {
                        return new Promise(function(r) {
                            let xhr = new XMLHttpRequest();
                            xhr.open('GET', chrome.runtime.getURL(filename), true);
                            xhr.onreadystatechange = function() {
                                if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                                    r(xhr.responseText);
                                }
                            };
                            xhr.send();
                        });
                    }
                    getCSV('files/category.csv').then(function(r) {
                        const categoryLists = [];
                        let categoryStrs = r.split(/\n/);
                        for (const categoryStr of categoryStrs) {
                            const category = {
                                name: categoryStr.split(",")[1].replace(/"/g, ""),
                                id: categoryStr.split(",")[0].replace(/"/g, "")
                            };
                            categoryLists.push(category);
                        }
                        //カテゴリ名をIDに変換
                        function translateID(str) {
                            for (const categoryList of categoryLists) {
                                if (categoryList.name === str) {
                                    return categoryList.id;
                                }
                            }
                            return "26395";
                        }
                        logArea.value += `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} > カテゴリデータベースを展開しました\n`;
                        document.getElementById("nowGettingData").innerHTML = "データ取得中";
                        //データ一覧を取得
                        const productTable = document.getElementById("productTable");
                        const dataRows = productTable.getElementsByTagName("tr");
                        logArea.value += `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} > データ一覧を取得しました データ数:${dataRows.length}\n`;
                        const dataArray = [];
                        const sources = [];
                        for (let i = 0; i < dataRows.length; i++) {
                            logArea.value += `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} > データ取得中: ${i + 1}/${dataRows.length}\n`;
                            document.getElementById("nowGettingData").innerHTML = `個別データ取得中: ${i + 1}/${dataRows.length}`;
                            if (dataRows[i].getElementsByClassName("label-danger").length > 0) {
                                logArea.value += `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} > 在庫なし:スキップしました\n`;
                                continue;
                            }
                            const indiData = {};
                            const category = dataRows[i].getElementsByClassName("categoryName");
                            const amazonBtn = dataRows[i].getElementsByClassName("fa-amazon");
                            const td = dataRows[i].getElementsByTagName("td");
                            if (category[0]) {
                                indiData.categoryName = category[0].innerHTML.slice(1, -1).replace(/&gt;/g, ">");
                                indiData.categoryId = translateID(indiData.categoryName);
                                indiData.itemName = category[0].parentNode.nextElementSibling.innerHTML.replace(/[!-\/:-@\[-\{-~]/g, function(s) {
                                    return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);
                                });
                                indiData.asin = (amazonBtn.length > 0) ? amazonBtn[0].parentNode.parentNode.getAttribute("href").replace("https://amazon.co.jp/dp/", "") : null;
                                indiData.price = td[4].firstElementChild.innerHTML;
                                logArea.value += `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} > 1次データを取得しました Ajaxを開始します\n`;
                                //個別ページにAjax
                                const ajaxUrl = td[7].firstElementChild.firstElementChild.getElementsByTagName("a")[0].getAttribute("href");
                                // Ajax通信を開始
                                $.ajax({
                                        url: ajaxUrl,
                                        type: 'GET',
                                        dataType: 'html',
                                        // フォーム要素の内容をハッシュ形式に変換
                                        data: $('form').serializeArray(),
                                        timeout: 10000,
                                        async: false
                                    })
                                    .done(function(data) {
                                        // 通信成功時の処理を記述
                                        indiData.explain = $(data).find('#yahaucproduct_description').val().replace(/\n/g, "").replace(/[!-\/:-@\[-\{-~]/g, function(s) {
                                            return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);
                                        });
                                        indiData.imgURL = [];
                                        for (let j = 0;; j++) {
                                            if ($(data).find(`#image${j}`).length ) {
                                                if($(data).find(`#image${j} img`).prop("naturalWidth") > $(data).find(`#image${j} img`).prop("naturalHeight") * 2.4){
                                                    continue;
                                                }
                                                if(!(indiData.imgURL.includes($(data).find(`#image${j} img`).attr('src')))){
                                                    indiData.imgURL.push($(data).find(`#image${j} img`).attr('src'));
                                                }
                                                sources.push($(data).find(`#image${j} img`).attr('src'));
                                            } else {
                                                break;
                                            }
                                        }
                                        logArea.value += `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} > 2次データを取得しました\n`;
                                        console.log();
                                    })
                                    .fail(function() {
                                        // 通信失敗時の処理を記述
                                        logArea.value += `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} > 2次データ取得にエラーが発生しました\n`;
                                        console.log("ERRORON AJAX");
                                    });
                            }
                            dataArray.push(indiData);
                        }
                        console.log(dataArray);
                        //CSV生成
                        chrome.storage.local.get({//<ITEM_NAME> <ITEM_EXPLAIN> <ASIN>
                            explainFormat: `<CENTER><BR><FONTSIZE='4'COLOR='#000000'>【在庫限りです】<ITEM_NAME> </FONT><BR><BR><TABLEBORDER=0CELLPADDING=5CELLSPACING=0WIDTH=500><TR><TDWIDTH=3%><BR></TD><TDWIDTH=27%><BR></TD><TDWIDTH=67%><BR></TD><TDWIDTH=3%><BR></TD></TR><TR><TDCOLSPAN='3'BGCOLOR='#000000'><FONTCOLOR=#FFFFFFSIZE=3><B>　商品説明</B></FONT></TD></TR><TR><TDCOLSPAN=4HEIGHT=10><BR></TD></TR><TR><TD><BR></TD><TDCOLSPAN=2ALIGN=left><FONTCOLOR=#000000SIZE=2><DIV><ITEM_EXPLAIN></DIV></FONT></TD><TD><BR></TD></TR><TR><TDWIDTH=3%><BR></TD><TDWIDTH=27%><BR></TD><TDWIDTH=67%><BR></TD><TDWIDTH=3%><BR></TD></TR><TR><TDCOLSPAN='3'BGCOLOR='#000000'><FONTCOLOR=#FFFFFFSIZE=3><B>　【配送・商品について】</B></FONT></TD></TR><TR><TDCOLSPAN=4HEIGHT=10><BR></TD></TR><TR><TD><BR></TD><TDCOLSPAN=2ALIGN=left><FONTCOLOR=#000000SIZE=2><P>（宅配便）&nbsp;全国一律送料無料<P>&nbsp;<P>商品は新品の未使用品となっております。<P>（商品の長期保管により、外箱・パッケージに多少の痛みなどがある場合がございます。そのため状態を未使用にちかいと設定させて頂いております）<P>もちろん、商品自体には不具合はございません、万が一あった場合でも対応させていただきますので、ご安心いただければと思います。<P>ご確認いただきまして、ありがとうございます。</FONT></TD><TD><BR></TD></TR><TR><TDWIDTH=3%><BR></TD><TDWIDTH=27%><BR></TD><TDWIDTH=67%><BR></TD><TDWIDTH=3%><BR></TD></TR><TR><TDCOLSPAN='3'BGCOLOR='#000000'><FONTCOLOR=#FFFFFFSIZE=3><B>　【お支払い】</B></FONT></TD></TR><TR><TDCOLSPAN=4HEIGHT=10><BR></TD></TR><TR><TD><BR></TD><TDCOLSPAN=2ALIGN=left><FONTCOLOR=#000000SIZE=2><P>★ヤフーかんたん決済をご利用頂けます★（手数料無料）<P>&nbsp;<P>・クレジットカード<P>・コンビニ払い<P>・銀行振込などが選択可能です。<P>ペイペイやTポイントも利用可能です。別途手数料は掛かりませんので安心ください。</FONT></TD><TD><BR></TD></TR><TR><TDWIDTH=3%><BR></TD><TDWIDTH=27%><BR></TD><TDWIDTH=67%><BR></TD><TDWIDTH=3%><BR></TD></TR><TR><TDCOLSPAN='3'BGCOLOR='#000000'><FONTCOLOR=#FFFFFFSIZE=3><B>　確認事項</B></FONT></TD></TR><TR><TDCOLSPAN=4HEIGHT=10><BR></TD></TR><TR><TD><BR></TD><TDCOLSPAN=2ALIGN=left><FONTCOLOR=#000000SIZE=2><P>トラブルを回避するためご確認いただきまして、ありがとうございます。<P>お手数ではございますが、落札前にご一読お願い致します！<P>○原則として、ご入金は3日以内でお願い致します。<P>○落札後3日を過ぎてもご連絡が無い場合は、落札者都合でのキャンセル扱いとなりますのでご了承ください<P>○ご入金後、可能な限り早く発送するようにしています<P>○商品説明/画像をよく確認の上、落札ください<P>○商品到着日含め2日以内の初期不良の連絡に限り、初期不良対応をさせて頂きます。※商品到着より2日以上経過の不具合に関しては個人間売買の為、対応いたしかねます。<P>○商品の使用方法や設定方法などの販売以外のアフターフォロー対応できかねます※メーカーに問い合わせるなどお願いしております。<P>○土日祝祭日は質問や落札されてもメールや商品発送等、対応できない日もございます。<P>○領収書の発行は対応しておりません。税務署に確認済でかんたん決済の画面の印刷で領収書代わりとなります。<P>○電話の対応はしておりません、取引ナビよりご連絡をお願いいたします。<P>○配送業者の指定、お届け希望日・希望時間帯、代引き、局/センター留め等はお受けできませんので、ご了承のうえ落札をお願い申し上げます。<BR><P><ASIN></P></FONT></TD><TD><BR></TD></TR></TABLE><BR><BR><BR></CENTER>`,
                            sokketuFee: 10
                        },function(items){
                            document.getElementById("nowGettingData").innerHTML = "CSV生成中";
                            let csvdata = "";
                            if(csvOutputMode === "yahooAuctionStore"){
                                csvdata = "管理番号,カテゴリ,タイトル,説明,ストア内商品検索用キーワード,開始価格,即決価格,個数,期間,終了時間,商品発送元の都道府県,商品発送元の市区町村,送料負担,代金先払い、後払い,商品の状態,画像1,画像1コメント,画像2,画像2コメント,画像3,画像3コメント,画像4,画像4コメント,画像5,画像5コメント,画像6,画像6コメント,画像7,画像7コメント,画像8,画像8コメント,画像9,画像9コメント,画像10,画像10コメント,最低評価,悪評割合制限,入札者認証制限,自動延長,商品の自動再出品,自動値下げ,注目のオークション,重量設定,消費税設定,税込みフラグ,JANコード・ISBNコード,ブランドID,商品スペックサイズ種別,商品スペックサイズID,商品分類ID,商品保存先フォルダパス,配送グループ,発送までの日数";
                                for (const indiData of dataArray) {
                                    const explain = items.explainFormat.replace(/<ITEM_NAME>/g,indiData.itemName).replace(/<ITEM_EXPLAIN>/g,indiData.explain).replace(/<ASIN>/g,``).replace(/＜/g,"<").replace(/＞/g,">").replace(/／/g,"/");
                                    csvdata += `\n${indiData.asin},${indiData.categoryId},${indiData.itemName.slice(0,64)},${explain.replace(/\n| /g,"")},,${indiData.price},${Number(indiData.price) + Number(items.sokketuFee)},${generalData.num},${generalData.holdingPeriod},0,${generalData.prefecture},,${generalData.postage},代金${generalData.paymentTiming},${generalData.state.replace("新品","未使用").replace(/中古|その他/g,"全体的に状態が悪い")},`;
                                    //画像挿入
                                    for (let i = 0; i < 10; i++) {
                                        csvdata += `${(indiData.imgURL.length > i)?indiData.imgURL[i].slice(indiData.imgURL[i].lastIndexOf("/") + 1).replace(/\+/g,"plus").replace(/-/g,"minus"):""},,`;
                                    }
                                    //              最低評価,                                                   悪評割合制限,                       入札者認証制限,                 自動延長,商品の自動再出品                ,自動値下げ,注目のオークション,重量設定,消費税設定,税込みフラグ,JANコード・ISBNコード,ブランドID,商品スペックサイズ種別,商品スペックサイズID,商品分類ID,商品保存先フォルダパス,配送グループ,発送までの日数
                                    csvdata += `${(generalData.auctownNyusatsuHyokaSegen === "はい")?0:-5},${generalData.auctownWaruiHyokaSegen},${generalData.auctownNinshoSegen},いいえ,${generalData.auctownSaishuppin},,,,0,はい,,,,,,${generalData.folder},${generalData.haisouGroup},${generalData.hassoudate}`;
                                }
                            }else{
                                //オークタウン
                                csvdata = "カテゴリ,タイトル,説明,開始価格,即決価格,個数,開催期間,終了時間,JANコード,画像1,画像1コメント,画像2,画像2コメント,画像3,画像3コメント,画像4,画像4コメント,画像5,画像5コメント,画像6,画像6コメント,画像7,画像7コメント,画像8,画像8コメント,画像9,画像9コメント,画像10,画像10コメント,商品発送元の都道府県,商品発送元の市区町村,送料負担,代金支払い,Yahoo!かんたん決済,かんたん取引,商品代引,商品の状態,商品の状態備考,返品の可否,返品の可否備考,入札者評価制限,悪い評価の割合での制限,入札者認証制限,自動延長,早期終了,値下げ交渉,自動再出品,自動値下げ,自動値下げ価格変更率,注目のオークション,おすすめコレクション,送料固定,荷物の大きさ,荷物の重量,ネコポス,ネコ宅急便コンパクト,ネコ宅急便,ゆうパケット,ゆうパック,発送までの日数,配送方法1,配送方法1全国一律価格,北海道料金1,沖縄料金1,離島料金1,配送方法2,配送方法2全国一律価格,北海道料金2,沖縄料金2,離島料金2,配送方法3,配送方法3全国一律価格,北海道料金3,沖縄料金3,離島料金3,配送方法4,配送方法4全国一律価格,北海道料金4,沖縄料金4,離島料金4,配送方法5,配送方法5全国一律価格,北海道料金5,沖縄料金5,離島料金5,配送方法6,配送方法6全国一律価格,北海道料金6,沖縄料金6,離島料金6,配送方法7,配送方法7全国一律価格,北海道料金7,沖縄料金7,離島料金7,配送方法8,配送方法8全国一律価格,北海道料金8,沖縄料金8,離島料金8,配送方法9,配送方法9全国一律価格,北海道料金9,沖縄料金9,離島料金9,配送方法10,配送方法10全国一律価格,北海道料金10,沖縄料金10,離島料金10,受け取り後決済サービス,海外発送,出品者情報開示前チェック";
                                for (const indiData of dataArray) {
                                    const explain = items.explainFormat.replace(/<ITEM_NAME>/g,indiData.itemName).replace(/<ITEM_EXPLAIN>/g,indiData.explain).replace(/<ASIN>/g,`<P>店舗用商品ID:${caesarShift(indiData.asin,2)}</P>`).replace(/＜/g,"<").replace(/＞/g,">").replace(/／/g,"/");
                                    csvdata += `\n${indiData.categoryId},${indiData.itemName.slice(0,64)},${explain.replace(/\n| /g,"")},${indiData.price},${indiData.price},${generalData.num},${generalData.holdingPeriod},0,,`;
                                    //画像挿入
                                    for (let i = 0; i < 10; i++) {
                                        csvdata += `${(indiData.imgURL.length > i)?indiData.imgURL[i].slice(indiData.imgURL[i].lastIndexOf("/") + 1).replace(/\+/g,"plus").replace(/-/g,"minus"):""},,`;
                                    }
                                    //"商品発送元の都道府県,商品発送元の市区町村,送料負担 ,代金支払い,                  Yahoo!かんたん決済,             かんたん取引,商品代引,      商品の状態,      商品の状態備考,返品の可否,返品の可否備考,入札者評価制限,                       悪い評価の割合での制限,                 入札者認証制限,                 自動延長,早期終了,値下げ交渉,自動再出品,              自動値下げ,自動値下げ価格変更率,注目のオークション,おすすめコレクション,送料固定,荷物の大きさ,荷物の重量,ネコポス,ネコ宅急便コンパクト,ネコ宅急便,ゆうパケット,ゆうパック,発送までの日数,配送方法1,配送方法1全国一律価格,北海道料金1,沖縄料金1,離島料金1,配送方法2,配送方法2全国一律価格,北海道料金2,沖縄料金2,離島料金2,配送方法3,配送方法3全国一律価格,北海道料金3,沖縄料金3,離島料金3,配送方法4,配送方法4全国一律価格,北海道料金4,沖縄料金4,離島料金4,配送方法5,配送方法5全国一律価格,北海道料金5,沖縄料金5,離島料金5,配送方法6,配送方法6全国一律価格,北海道料金6,沖縄料金6,離島料金6,配送方法7,配送方法7全国一律価格,北海道料金7,沖縄料金7,離島料金7,配送方法8,配送方法8全国一律価格,北海道料金8,沖縄料金8,離島料金8,配送方法9,配送方法9全国一律価格,北海道料金9,沖縄料金9,離島料金9,配送方法10,配送方法10全国一律価格,北海道料金10,沖縄料金10,離島料金10,受け取り後決済サービス,海外発送,出品者情報開示前チェック"
                                    csvdata += `${generalData.prefecture},,${generalData.postage},${generalData.paymentTiming},${generalData.yahooSettlement},,${generalData.daibiki},${generalData.state},,${generalData.returnable},,${generalData.auctownNyusatsuHyokaSegen},${generalData.auctownWaruiHyokaSegen},${generalData.auctownNinshoSegen},いいえ,はい,いいえ,${generalData.auctownSaishuppin},,,,,,,,,,,,,${generalData.auctownNisuu},${generalData.auctownHaiso},,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,いいえ,いいえ,いいえ`;
                                }
                            }
                            document.getElementById("nowGettingData").innerHTML = "ZIPファイル生成中";
                            downloadImages(csvdata, sources, csvOutputMode);
                            clearInterval(loadingInterval);

                        });
                    });
                }
            }
        }
        console.log("loading...");
    }, 300);

    function openGetDialog() {
        const auctownLayer = document.getElementById('auctownLayer');
        const auctownDialog = document.getElementById('auctownDialog');
        const exportAuctownBtn = document.getElementById("exportAuctownBtn");
        exportAuctownBtn.addEventListener('click', function() {
            auctownLayer.style.visibility = 'visible';
            auctownDialog.style.visibility = 'visible';
        });
        auctownLayer.addEventListener('click', function() {
            auctownLayer.style.visibility = 'hidden';
            auctownDialog.style.visibility = 'hidden';
        });
    }

    function insertDialog() {
        document.body.insertAdjacentHTML("beforeEnd", `
            <div id="auctownLayer"></div>
            <div id="auctownDialog" class="auctownDialog">
                <div>
                    開催期間(2~7)<span class="required"></span><br><input type="number" id="auctownKaisaikikan" value="7">日間
                </div>
                <div>
                    販売個数(1~9)<span class="required"></span><br><input type="number" id="auctownKosuu" value="1">個
                </div>
                <div>
                    発送元都道府県<span class="required"></span><br>
                    <select name="pref_name" id="auctownTodofuken">
                    <option value="北海道">北海道</option>
                    <option value="青森県">青森県</option>
                    <option value="岩手県">岩手県</option>
                    <option value="宮城県">宮城県</option>
                    <option value="秋田県">秋田県</option>
                    <option value="山形県">山形県</option>
                    <option value="福島県">福島県</option>
                    <option value="茨城県">茨城県</option>
                    <option value="栃木県">栃木県</option>
                    <option value="群馬県">群馬県</option>
                    <option value="埼玉県">埼玉県</option>
                    <option value="千葉県">千葉県</option>
                    <option value="東京都" selected>東京都</option>
                    <option value="神奈川県">神奈川県</option>
                    <option value="新潟県">新潟県</option>
                    <option value="富山県">富山県</option>
                    <option value="石川県">石川県</option>
                    <option value="福井県">福井県</option>
                    <option value="山梨県">山梨県</option>
                    <option value="長野県">長野県</option>
                    <option value="岐阜県">岐阜県</option>
                    <option value="静岡県">静岡県</option>
                    <option value="愛知県">愛知県</option>
                    <option value="三重県">三重県</option>
                    <option value="滋賀県">滋賀県</option>
                    <option value="京都府">京都府</option>
                    <option value="大阪府">大阪府</option>
                    <option value="兵庫県">兵庫県</option>
                    <option value="奈良県">奈良県</option>
                    <option value="和歌山県">和歌山県</option>
                    <option value="鳥取県">鳥取県</option>
                    <option value="島根県">島根県</option>
                    <option value="岡山県">岡山県</option>
                    <option value="広島県">広島県</option>
                    <option value="山口県">山口県</option>
                    <option value="徳島県">徳島県</option>
                    <option value="香川県">香川県</option>
                    <option value="愛媛県">愛媛県</option>
                    <option value="高知県">高知県</option>
                    <option value="福岡県">福岡県</option>
                    <option value="佐賀県">佐賀県</option>
                    <option value="長崎県">長崎県</option>
                    <option value="熊本県">熊本県</option>
                    <option value="大分県">大分県</option>
                    <option value="宮崎県">宮崎県</option>
                    <option value="鹿児島県">鹿児島県</option>
                    <option value="沖縄県">沖縄県</option>
                    </select>
                </div>
                <div>
                        商品状態<span class="required"></span><br>
                        <select name="shohinJotai" id="shohinJotai">
                            <option value="新品">新品</option>
                            <option value="未使用に近い" selected>未使用に近い</option>
                            <option value="目立った傷や汚れなし">目立った傷や汚れなし</option>
                            <option value="やや傷や汚れあり">やや傷や汚れあり</option>
                            <option value="傷や汚れあり">傷や汚れあり</option>
                            <option value="全体的に状態が悪い">全体的に状態が悪い</option>
                            <option value="中古">中古</option>
                            <option value="その他">その他</option>
                        </select>
                    </div>
                <div>
                    返品可否<span class="required"></span><br>
                    <select name="auctownHenpin" id="auctownHenpin">
                        <option value="返品可">返品可</option>
                        <option value="返品不可" selected>返品不可</option>
                    </select>
                </div>
                <div>
                    Yahoo!かんたん決済<span class="required"></span><br>
                    <select name="auctownKessai" id="auctownKessai">
                        <option value="はい" selected>はい</option>
                        <option value="いいえ">いいえ</option>
                    </select>
                </div>
                <div>
                    代金支払い<span class="required"></span><br>
                    <select name="auctownDaikin" id="auctownDaikin">
                        <option value="先払い" selected>先払い</option>
                        <option value="後払い">後払い</option>
                    </select>
                </div>
                <div>
                    送料負担<span class="required"></span><br>
                    <select name="auctownSoryo" id="auctownSoryo">
                        <option value="落札者">落札者負担</option>
                        <option value="出品者" selected>出品者負担</option>
                    </select>
                </div>
                <div>
                    発送までの日数<span class="required"></span><br>
                    <select name="auctownNisuu" id="auctownNisuu">
                        <option value="1日～2日" selected>1日～2日</option>
                        <option value="2日～3日">2日～3日</option>
                        <option value="3日～7日">3日～7日</option>
                    </select>
                </div>
                <div>
                    自動再出品(0~3)<span class="required"></span><br>
                    <select name="auctownSaishuppin" id="auctownSaishuppin">
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3" selected>3</option>
                    </select>
                </div>
                <div>
                    配送方法<br>
                    <input type="text" id="auctownHaiso" value="宅配便【送料無料】">
                </div>
                <div>
                        商品代引<br>
                        <select name="auctownDaibiki" id="auctownDaibiki">
                            <option value="はい">代引き可能</option>
                            <option value="いいえ" selected>代引き不可能</option>
                        </select>
                    </div>
                    <div>
                    入札者評価制限<br>
                        <select name="auctownNyusatsuHyokaSegen" id="auctownNyusatsuHyokaSegen">
                            <option value="はい" selected>はい</option>
                            <option value="いいえ">いいえ</option>
                        </select>
                    </div>
                    <div>
                    悪い評価の割合で制限<br>
                        <select name="auctownWaruiHyokaSegen" id="auctownWaruiHyokaSegen">
                            <option value="はい" selected>はい</optionはい</option>
                            <option value="いいえ">いいえ</option>
                        </select>
                    </div>
                    <div>
                    入札者認証制限<br>
                        <select name="auctownNinshoSegen" id="auctownNinshoSegen">
                            <option value="はい" selected>はい</option>
                            <option value="いいえ">いいえ</option>
                        </select>
                    </div>
                    <div>
                        ※ヤフオクストアのみ 配送グループ<br>
                        <input type="number" id="haisouGroup" value="1">
                    </div>
                    <div>
                        ※ヤフオクストアのみ 商品保存先フォルダパス
                        <br>
                        <input type="text" id="folder" value="ヤフオク０１">
                    </div>
                    <div>
                        ※ヤフオクストアのみ 発送までの日数(グループ) 設定なしor1~100
                        <br>
                        <input type="number" id="hassoudate" placeholder="設定なし">
                    </div>
                    
                <button id="auctownGetStart">オークタウン取得開始</button>
                <button id="yahooStoreGetStart">ヤフオクストア取得開始</button>
            </div>
        `);
    }

    function insertStyle() {
        document.head.insertAdjacentHTML("beforeEnd", `
            <style>
                #moreOptionArea{
                    display: none;
                }
                .auctownDialog{
                    background-color: #fff;
                    display: block;
                    position: absolute;
                    top: 5%;
                    left: 50%;
                    z-index: 10001;
                    transform: translate(-50%, 0%);
                    padding: 3em;
                    width: 80%;
                    min-width: 500px;
                    visibility: hidden;
                }
                #auctownLayer{
                    display:block;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width:100%;
                    height:100%;
                    z-index: 10000;
                    background-color:#000a;
                    visibility: hidden;
                }
                .auctownDialog > div{
                    margin-bottom:1em;
                    border-bottom: 1px solid #ccc;
                    padding: 0.5em;
                }
                .auctownDialog input,.auctownDialog select{
                    width:15em;
                }
                .required::before{
                    color:red;
                    content:"*";
                    width:1em;
                    height:1em;
                    font-weight:bold;
                }
                #auctownGetStart,#yahooStoreGetStart{
                    padding: .5em 1em;
                }
                div.gettingData{
                    border:1px solid #ccc;
                    margin:0 auto;
                    width:100%;
                }
                .displayForce{
                    visibility: visible !important;
                }
                #auctownLog{
                    width:90%;
                    height:12em;
                }
            </style>
        `);
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



// 画像の一括ダウンロード
async function downloadImages(csvdata, sources) {

    //CSVのバイナリデータを作る
    let blob = new Blob([new Uint8Array(Encoding.convert(Encoding.stringToCode(csvdata), 'sjis', 'unicode'))], { type: "text/csv" });
    let uri = URL.createObjectURL(blob);
    //画像URLに追加
    sources.push(uri);
    console.log(sources);
    // JSZip に追加するために非同期リクエストを Promise で wrap
    const imagePromises = sources.map(
        (src, i) => new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', src, true);
            xhr.responseType = "blob";
            xhr.onload = function() {
                // ファイル名とデータ返却
                const fileName = (src.includes("blob:https://dseller.net/")) ? "dseller.csv" : src.slice(src.lastIndexOf("/") + 1).replace(/\+/g, "plus").replace(/-/g, "minus");
                resolve({ data: this.response, fileName: fileName });
            };
            // reject だと await Promise.all を抜けてしまう
            // => resolve でデータ無し
            xhr.onerror = () => resolve({ data: null });
            xhr.onabort = () => resolve({ data: null });
            xhr.ontimeout = () => resolve({ data: null });
            xhr.send();
        })
    );


    // すべての画像が取得できたら zip 生成
    const images = await Promise.all(imagePromises);
    generateImagesZip(images);
}

// zip ファイルで画像をダウンロード
function generateImagesZip(images) {
    let zip = new JSZip();

    // フォルダ作成
    const folderName = "download";
    //let folder = zip.folder(folderName);

    // フォルダ下に画像を格納
    images.forEach(image => {
        if (image.data && image.fileName) {
            zip.file(image.fileName, image.data)
        }
    });

    // zip を生成
    zip.generateAsync({ type: "blob" }).then(blob => {

        // ダウンロードリンクを 生成
        let dlLink = document.createElement("a");

        // blob から URL を生成
        const dataUrl = URL.createObjectURL(blob);
        dlLink.href = dataUrl;
        dlLink.download = `${folderName}.zip`;

        // 設置/クリック/削除
        document.body.insertAdjacentElement("beforeEnd", dlLink);
        dlLink.click();
        dlLink.remove();

        // オブジェクト URL の開放
        setTimeout(function() {
            window.URL.revokeObjectURL(dataUrl);
        }, 1000);
        //終了処理
        const auctownDialog = document.getElementById('auctownDialog');
        const auctownLayer = document.getElementById('auctownLayer');
        auctownDialog.classList.remove("displayForce");
        auctownLayer.classList.remove("displayForce");
                    auctownDialog.innerHTML = `
                        <h3>取得完了しました</h3>
                    `;
    });
}