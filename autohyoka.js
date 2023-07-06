function autoHyokaBtnSet(){
    const table = document.getElementById("resultTable");
    const nameqs = table.querySelectorAll(".auctionTr td.tl.p_5 .resubmit_title");
    //ボタン挿入
    for(const nameq of nameqs){
        if( nameq.querySelector("a").innerHTML.includes("相互評価") || nameq.parentNode.parentNode.querySelector("td.tr").childNodes[0].nodeValue.trim() === "1 円" ){
            nameq.parentNode.parentNode.querySelector("td.tr").insertAdjacentHTML("beforeEnd",`
            <span>
                <a class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only auto-hyoka" style="font-size: 11px;">
                    <span class="ui-button-text" style="padding: 0.2em 0.5em; font-weight: normal;">
                        自動評価
                    </span>
                </a>
            </span>
            `);
        }
    }
    //ボタン押下時動作
    const autobtns =document.getElementsByClassName("auto-hyoka");
    for(const autobtn of autobtns){
        autobtn.addEventListener("click",function(){
            if(!window.confirm("一括処理を開始します。")){
                return;
            }
            autobtn.classList.add("ajax-loading");
            //生成したURLからAjax
            chrome.runtime.sendMessage(
                {
                    action: 'getHTML',
                    endpoint: autobtn.parentNode.parentNode.parentNode.querySelector(".tl.p_5 .resubmit_title a").getAttribute("href")
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
                        const ajaxhtml1 = parser.parseFromString(response, "text/html");
                        const url = ajaxhtml1.querySelector("#closedHeader .u-textCenter a").getAttribute("href");
                        autoHyokaMain(url,autobtn);
                    }
                }
            );
        })
    }
}

function autoHyokaMain(url,autobtn){
    //生成したURLからAjax
    chrome.storage.local.get({
        autoHyokaState: false
    },function(items){
        if(items.autoHyokaState){
            alert("同一アカウントのブラウザ内で同時に別の一括処理を行わないでください。");
            return;
        }else{
            chrome.storage.local.set({
                autoHyokaState: true
            },function(){
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
                            const trs = ajaxhtml.querySelectorAll(".acMdBuyerList > table > tbody > tr");
                            //行について注目
                            let cnt = 0,j=0;
                            const forinterval = setInterval(function(){
                                const tr = trs[j];
                                //支払いが完了していたら
                                if(tr){
                                    if(tr.querySelector(".ptsPayment span") === null){
                                        alert("1件しかないため自動処理できません");
                                        return;
                                    }
                                    if(tr.querySelector(".ptsPayment span").classList.contains("decIcoCheck")){
                                        //評価
                                            setTimeout(function(){
                                                autoHyokaHyoka(tr.querySelector(".ptsBtn > div:last-child > a").getAttribute("href"),autobtn,cnt++);
                                            },10000);
                                            //発送をトライ
                                            hassouRenraku(tr.querySelector(".ptsBtn > div:first-child > a").getAttribute("href"),autobtn,cnt++);
                                    }
                                }
                                if(++j > trs.length ){
                                    clearInterval(forinterval);
                                    setTimeout(function(){
                                        autobtn.classList.remove("ajax-loading");
                                        chrome.storage.local.set({
                                            autoHyokaState: false
                                        },function(){
                                            alert("一括処理が完了しました。");
                                        });
                                    },10000);
                                }
                            },1000);
                        }
                    }
                );
            });
        }
    })
}

function autoHyokaHyoka(url,autobtn,cnt){
    if(!url)
        return;
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
                if(response.includes("last-irating")){
                    console.log("評価済み: "+url);
                    return;
                }
                console.log("未評価: "+url);
                const parser = new DOMParser();
                const ajaxhtml = parser.parseFromString(response, "text/html");
                
                const form = ajaxhtml.getElementsByTagName("form")[0];
                const newformhtml = `
                <form id="ext-hyoka-form-${ajaxhtml.getElementsByName("aID")[0].value}-${cnt}" class="unvisibleForm" target="_blank" method="post" action="https://auctions.yahoo.co.jp/jp/submit/leavefeedback">
                    ${form.innerHTML}
                    <input type="hidden" name="previewComment" value="%E3%81%82%E3%82%8A%E3%81%8C%E3%81%A8%E3%81%86%E3%81%94%E3%81%96%E3%81%84%E3%81%BE%E3%81%97%E3%81%9F%E3%80%82%E3%81%A8%E3%81%A6%E3%82%82%E8%89%AF%E3%81%84%E5%8F%96%E5%BC%95%E3%81%8C%E3%81%A7%E3%81%8D%E3%81%BE%E3%81%97%E3%81%9F%E3%80%82%E3%81%BE%E3%81%9F%E6%A9%9F%E4%BC%9A%E3%81%8C%E3%81%82%E3%82%8A%E3%81%BE%E3%81%97%E3%81%9F%E3%82%89%E3%80%81%E3%82%88%E3%82%8D%E3%81%97%E3%81%8F%E3%81%8A%E9%A1%98%E3%81%84%E3%81%84%E3%81%9F%E3%81%97%E3%81%BE%E3%81%99%E3%80%82">
                    <input type="hidden" name="rating" value="veryGood">
                </form>`;
                
                document.body.insertAdjacentHTML("beforeend", newformhtml);
                const newform = document.getElementById(String(`ext-hyoka-form-${ajaxhtml.getElementsByName("aID")[0].value}-${cnt}`));
                newform.submit();
            }
        }
    );
}

//発送連絡
function hassouRenraku(url, autobtn, cnt){
    if(!url)
        return;
    //生成したURLからAjax
    chrome.runtime.sendMessage(
        {
            action: 'getHTML',
            endpoint: "https://contact.auctions.yahoo.co.jp"+url
        },
        (response) => {
            if(response.error){
                //エラー時
                alert("ERROR");
                console.log(response);
                return;
            }else{
                const parser = new DOMParser();
                const ajaxhtml = parser.parseFromString(response, "text/html");
                const blueBtn = ajaxhtml.querySelector(".libBtnBlueL");
                if(blueBtn.value === "発送連絡をする"){
                    window.open("https://contact.auctions.yahoo.co.jp"+url+"&exmode=true");
                }
            }
        }
    );
}

if(location.href.includes("https://contact.auctions.yahoo.co.jp/seller/top") && location.href.includes("&exmode=true")){
    document.querySelector(".libBtnBlueL").click();
}

if(location.href.includes("https://contact.auctions.yahoo.co.jp/seller/edit") &&
    (document.querySelector(".decItmName").innerHTML.includes("相互評価") || document.querySelector(".decPrice").innerHTML.includes("落札価格： 1円"))){
        document.querySelector(".libBtnBlueL").click();
}

if(location.href === "https://contact.auctions.yahoo.co.jp/seller/preview"&&
    (document.querySelector(".decItmName").innerHTML.includes("相互評価") || document.querySelector(".decPrice").innerHTML.includes("落札価格： 1円"))){
        document.querySelector(".libBtnRedL").click();
}
