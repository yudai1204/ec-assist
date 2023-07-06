chrome.storage.local.get({
    mercariRecentTrade: null,
    titleBefore:"新品★"
},function(items){
    const tradeData = items.mercariRecentTrade;
    document.getElementById("orderTitle").insertAdjacentHTML("afterBegin",tradeData.title);
    document.getElementById("orderYahooImg").innerHTML = `<img src="${tradeData.img}" style="max-width:120px;max-height:120px;">`;
    document.getElementById("orderPost").innerHTML = "〒"+tradeData.postnum1+"-"+tradeData.postnum2;
    document.getElementById("orderAddress").innerHTML = `${tradeData.prefecture} ${tradeData.municipality} ${tradeData.choume} ${tradeData.apart}`;
    document.getElementById("orderName").innerHTML = tradeData.name;
    document.getElementById("orderID").innerHTML = tradeData.id;
    document.getElementById("price").innerHTML = (tradeData.price == "取得できません")?tradeData.price:tradeData.price+"円";
    document.getElementById("manageCode").innerHTML = (tradeData.manageCode)?`<a href="javascript:void(0);" id="manageCodeCopy">${tradeData.manageCode}</a>`:"取得できません";
    //コピー部分
    document.querySelector("#orderTitle button").addEventListener("click",function(){
        setClipboard(tradeData.title,"text/plain");
    });
    document.getElementById("copyAmzn").addEventListener("click",function(){
        setClipboard(JSON.stringify(tradeData),"text/plain");
    });
    if(document.getElementById("manageCodeCopy")){
        document.getElementById("manageCodeCopy").addEventListener("click",function(){
            setClipboard(`https://www.amazon.co.jp/dp/${tradeData.manageCode}`,"text/plain");
        });
    }
    document.getElementById("copySpread").addEventListener("click",function(){
        const data1 = items.titleBefore;
        const data2 = "1";//個数
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
            </colgroup>
            <tbody>
                <tr style="height: 21px;">
                    <td data-sheets-value="{&quot;1&quot;:3,&quot;3&quot;:${44743 + Math.floor((new Date(tradeData.date.replace(/年|月/g,"/").replace("日","")).getTime()-new Date("2022-7-1 00:00 JST").getTime())/(1000*60*60*24))}}"
                        data-sheets-numberformat="{&quot;1&quot;:5,&quot;2&quot;:&quot;m/d&quot;,&quot;3&quot;:1}"
                        style="border: 1px solid rgb(0, 0, 0); overflow: hidden; padding: 2px 3px; vertical-align: bottom; text-align: right;font-size: 10pt;">
                        ${new Date(tradeData.date.replace(/年|月/g,"/").replace("日","")).getMonth()+1}/${new Date(tradeData.date.replace(/年|月/g,"/").replace("日","")).getDate()}</td>
                    <td
                        style="border-width: 1px; border-style: solid; border-color: rgb(0, 0, 0) rgb(0, 0, 0) rgb(0, 0, 0) rgb(204, 204, 204); border-image: initial; overflow: hidden; padding: 2px 3px; vertical-align: bottom;font-size: 12pt;">
                    </td>
                    <td data-sheets-value="{&quot;1&quot;:2,&quot;2&quot;:&quot;${data1+tradeData.title}&quot;}"
                        style="border-width: 1px; border-style: solid; border-color: rgb(0, 0, 0) rgb(0, 0, 0) rgb(0, 0, 0) rgb(204, 204, 204); border-image: initial; overflow: hidden; padding: 2px 3px; vertical-align: bottom;font-size: 12pt;">
                        ${data1+tradeData.title}</td>
                    <td data-sheets-value="{&quot;1&quot;:3,&quot;3&quot;:${data2}}"
                        style="border-width: 1px; border-style: solid; border-color: rgb(0, 0, 0) rgb(0, 0, 0) rgb(0, 0, 0) rgb(204, 204, 204); border-image: initial; overflow: hidden; padding: 2px 3px; vertical-align: bottom; background-color: rgb(244, 204, 204); font-size: 11pt; text-decoration: underline; text-align: center;">
                        ${data2}</td>
                    <td data-sheets-value="{&quot;1&quot;:3,&quot;3&quot;:${(tradeData.price == "取得できません")?0:tradeData.price}}"
                        style="border-width: 1px; border-style: solid; border-color: rgb(0, 0, 0) rgb(0, 0, 0) rgb(0, 0, 0) rgb(204, 204, 204); border-image: initial; overflow: hidden; padding: 2px 3px; vertical-align: bottom; font-family: Arial; font-size: 12pt; font-weight: normal; text-align: right;">
                        ${(tradeData.price == "取得できません")?0:tradeData.price}</td>
                </tr>
            </tbody>
        </table>
    </google-sheets-html-origin>`,"text/html");
    });
})

function setClipboard(data,type){
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