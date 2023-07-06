let csvdata = [];

document.getElementById("upload").addEventListener("click", function () {
    if(csvdata.length === 0) {
        alert("ファイルを選択してください。");
        return;
    }
    const haru_arrays = [];
    for(const item of csvdata) {
        haru_arrays.push([
            item[0],    //ASIN
            item[2],    //アイテム名
            item[41],   //価格
            item[48],   //FBA有無
            item[75]    //取得日時
        ]);
    }
    console.log(csvdata);
    chrome.runtime.sendMessage(
        {
            action: 'getJson',
            endpoint: 'https://raw.githubusercontent.com/yudai1204/ec-assist/main/gasProfile.json'
        },
        (response) => {
            if (response.error) {
                //エラー時
                console.log(response);
                return;
            } else {
                chrome.storage.local.get({
                    gasurl: ""
                }, function (itemss) {
                    let postparam =
                    {
                        "method": "POST",
                        "Content-Type": "application/json",
                        "body": JSON.stringify({
                            "mode": "haru_upload",
                            "data": haru_arrays
                        })
                    };
                    fetch(itemss.gasurl || response.gasurl, postparam)
                        .then(response => {
                            console.log(response);
                            return response.json();
                        })
                        .then(json => {
                            // レスポンス json の処理
                            console.log("OK");
                            console.log(json);
                            alert("アップロード完了");
                        })
                })
            }
        });
})




let fileInput = document.getElementById('harucsv');
let message = document.getElementById('message');
let fileReader = new FileReader();

// ファイル変更時イベント
fileInput.onchange = () => {
    let file = fileInput.files[0];
    fileReader.readAsText(file, "Shift_JIS");
};

// ファイル読み込み時
let items = [];
fileReader.onload = () => {
    // ファイル読み込み
    let fileResult = fileReader.result.split('\n');

    // 先頭行をヘッダとして格納
    let header = fileResult[0].split(',')
    // 先頭行の削除
    fileResult.shift();

    // CSVから情報を取得
    const csv = [];
    for(const item of fileResult){
        csv.push(item.slice(1,-1).split('","'));
    }
    console.log(csv)
    csvdata = csv;
}

// ファイル読み取り失敗時
fileReader.onerror = () => {
    alert("ファイル読み取りに失敗しました。");
}

//旧オプション
document.getElementById("save").addEventListener("click", function(){
    chrome.storage.local.set({
        width: Number(document.getElementById("winW").value),
        sokketuFee: Number(document.getElementById("storeMargin").value),
        height: Number(document.getElementById("winH").value),
        phoneNum: document.getElementById("phoneNum").value,
        titleBefore: document.getElementById("titleBefore").value,
        getMercariMoreMode: document.getElementById("getMercariMoreMode").checked,
        mercariPlaceholder: document.getElementById("mercariPlaceholder").value,
        explainFormat: document.getElementById("explainFormat").value,
        gasurl: document.getElementById("gasurl").value
    },function(){
        document.getElementById("log").innerHTML = "保存しました";
        setTimeout(function(){
            document.getElementById("log").innerHTML = "";
        },2000);
    });
});

chrome.storage.local.get({
    width: 640,
    sokketuFee: 10,
    height: 480,
    phoneNum: "000-0000-0000",
    titleBefore: "新品★",
    gasurl: "",
    mercariPlaceholder:`この度は当店よりご購入頂きありがとうございます。 
商品到着までしばらくお待ち下さいませ。 


ご注文いただいた商品は発送準備が整いましたのでご連絡申し上げます。 


 - 商品について - 
当店にて販売する商品は商品品質・管理から発送までを
一元管理を行なっている専門会社に委託しております。 

- 委託会社 - 
楽天倉庫、ヤマトフルフィルメント、福山運送、αmαzon、配送ロジスティックス配送など。 


- 発送について - 
敏速にご購入者様へ商品をお届けすることを念頭とし、
お届け先ご住所により近い近隣の営業所からの発送となります。 
委託会社の配送システムを利用した自動処理の上、発送致しております。 


- ご注意 - 
商品をお受け取りの際、楽天やαmαzonからのお届けにより 
「誤配送！？」とご心配される購入者様が一定数おられます。 


この場合、当店からのお荷物である可能性がございますので 
その際、商品のお受け取りを了承いただければ幸いでございます。 


また、配送時の商品間違いや初期不良についての対応は速やかにさせていただきますので 
お気軽にお問い合わせください。 
※商品のイメージと違う、サイズが違う等のお問い合わせについては 
　対応致しかねますので何卒、ご了承ください。 

- インフォメーション - 
当店では今後も様々なアイテムを出品して参りますので、 
フォローいただければスタッフ共々励みになります。 

また、各SNSとの連携や当店限定クーポン発行等
お客様のニーズに寄り添った店舗運営に努めて参りますので 
今後とも宜しくお願い致します。`,
explainFormat:`<CENTER><BR>
<FONTSIZE='4'COLOR='#000000'>【在庫限りです】<ITEM_NAME>
        </FONT><BR><BR>
        <TABLEBORDER=0CELLPADDING=5CELLSPACING=0WIDTH=500>
            <TR>
                <TDWIDTH=3%><BR></TD>
                    <TDWIDTH=27%><BR></TD>
                        <TDWIDTH=67%><BR></TD>
                            <TDWIDTH=3%><BR></TD>
            </TR>
            <TR>
                <TDCOLSPAN='3'BGCOLOR='#000000'>
                    <FONTCOLOR=#FFFFFFSIZE=3><B>　商品説明</B></FONT>
                        </TD>
            </TR>
            <TR>
                <TDCOLSPAN=4HEIGHT=10><BR></TD>
            </TR>
            <TR>
                <TD><BR></TD>
                <TDCOLSPAN=2ALIGN=left>
                    <FONTCOLOR=#000000SIZE=2>
                        <DIV>
                            <ITEM_EXPLAIN>
                        </DIV>
                        </FONT>
                        </TD>
                        <TD><BR></TD>
            </TR>
            <TR>
                <TDWIDTH=3%><BR></TD>
                    <TDWIDTH=27%><BR></TD>
                        <TDWIDTH=67%><BR></TD>
                            <TDWIDTH=3%><BR></TD>
            </TR>
            <TR>
                <TDCOLSPAN='3'BGCOLOR='#000000'>
                    <FONTCOLOR=#FFFFFFSIZE=3><B>　【配送・商品について】</B></FONT>
                        </TD>
            </TR>
            <TR>
                <TDCOLSPAN=4HEIGHT=10><BR></TD>
            </TR>
            <TR>
                <TD><BR></TD>
                <TDCOLSPAN=2ALIGN=left>
                    <FONTCOLOR=#000000SIZE=2>
                        <P>（宅配便）&nbsp;全国一律送料無料
                        <P>&nbsp;
                        <P>商品は新品の未使用品となっております。
                        <P>（商品の長期保管により、外箱・パッケージに多少の痛みなどがある場合がございます。そのため状態を未使用にちかいと設定させて頂いております）
                        <P>もちろん、商品自体には不具合はございません、万が一あった場合でも対応させていただきますので、ご安心いただければと思います。
                        <P>ご確認いただきまして、ありがとうございます。</FONT>
                            </TD>
                            <TD><BR></TD>
            </TR>
            <TR>
                <TDWIDTH=3%><BR></TD>
                    <TDWIDTH=27%><BR></TD>
                        <TDWIDTH=67%><BR></TD>
                            <TDWIDTH=3%><BR></TD>
            </TR>
            <TR>
                <TDCOLSPAN='3'BGCOLOR='#000000'>
                    <FONTCOLOR=#FFFFFFSIZE=3><B>　【お支払い】</B></FONT>
                        </TD>
            </TR>
            <TR>
                <TDCOLSPAN=4HEIGHT=10><BR></TD>
            </TR>
            <TR>
                <TD><BR></TD>
                <TDCOLSPAN=2ALIGN=left>
                    <FONTCOLOR=#000000SIZE=2>
                        <P>★ヤフーかんたん決済をご利用頂けます★（手数料無料）
                        <P>&nbsp;
                        <P>・クレジットカード
                        <P>・コンビニ払い
                        <P>・銀行振込などが選択可能です。
                        <P>ペイペイやTポイントも利用可能です。別途手数料は掛かりませんので安心ください。</FONT>
                            </TD>
                            <TD><BR></TD>
            </TR>
            <TR>
                <TDWIDTH=3%><BR></TD>
                    <TDWIDTH=27%><BR></TD>
                        <TDWIDTH=67%><BR></TD>
                            <TDWIDTH=3%><BR></TD>
            </TR>
            <TR>
                <TDCOLSPAN='3'BGCOLOR='#000000'>
                    <FONTCOLOR=#FFFFFFSIZE=3><B>　確認事項</B></FONT>
                        </TD>
            </TR>
            <TR>
                <TDCOLSPAN=4HEIGHT=10><BR></TD>
            </TR>
            <TR>
                <TD><BR></TD>
                <TDCOLSPAN=2ALIGN=left>
                    <FONTCOLOR=#000000SIZE=2>
                        <P>トラブルを回避するためご確認いただきまして、ありがとうございます。
                        <P>お手数ではございますが、落札前にご一読お願い致します！
                        <P>○原則として、ご入金は3日以内でお願い致します。
                        <P>○落札後3日を過ぎてもご連絡が無い場合は、落札者都合でのキャンセル扱いとなりますのでご了承ください
                        <P>○ご入金後、可能な限り早く発送するようにしています
                        <P>○商品説明/画像をよく確認の上、落札ください
                        <P>○商品到着日含め2日以内の初期不良の連絡に限り、初期不良対応をさせて頂きます。※商品到着より2日以上経過の不具合に関しては個人間売買の為、対応いたしかねます。
                        <P>○商品の使用方法や設定方法などの販売以外のアフターフォロー対応できかねます※メーカーに問い合わせるなどお願いしております。
                        <P>○土日祝祭日は質問や落札されてもメールや商品発送等、対応できない日もございます。
                        <P>○領収書の発行は対応しておりません。税務署に確認済でかんたん決済の画面の印刷で領収書代わりとなります。
                        <P>○電話の対応はしておりません、取引ナビよりご連絡をお願いいたします。
                        <P>○配送業者の指定、お届け希望日・希望時間帯、代引き、局/センター留め等はお受けできませんので、ご了承のうえ落札をお願い申し上げます。<BR>
                        <P>
                            <ASIN>
                        </P>
                        </FONT>
                        </TD>
                        <TD><BR></TD>
            </TR>
            </TABLE><BR><BR><BR>
</CENTER>`,
    getMercariMoreMode: true
},function(items){
    document.getElementById("winW").value = items.width;
    document.getElementById("winH").value = items.height;
    document.getElementById("phoneNum").value = items.phoneNum;
    document.getElementById("titleBefore").value = items.titleBefore;
    document.getElementById("getMercariMoreMode").checked = items.getMercariMoreMode;
    document.getElementById("mercariPlaceholder").value = items.mercariPlaceholder;
    document.getElementById("explainFormat").value = items.explainFormat;
    document.getElementById("gasurl").value = items.gasurl;
    document.getElementById("storeMargin").value = items.sokketuFee;
});




