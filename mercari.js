function getMercari(){
    const reloadMercari = setInterval(() =>{
        const areas = document.getElementsByClassName("css-1ozxtjg");
        const areas2 = document.getElementsByClassName("css-hbn72w");
        console.log(areas.length);
        if(areas.length + areas2.length > 0){
            clearInterval(reloadMercari);
            if(document.getElementsByClassName("data-copy-button").length > 0) return;
            document.head.insertAdjacentHTML("beforeend",`
                <style>
                .data-copy-button{
                    margin: .1em 0 .5em 0;
                    background-color: #faa;
                    border:1px solid #a00;
                    border-radius: 4px;
                    padding: .2em .5em;
                }
                .data-copy-button:hover{
                    background-color: #d88;
                }
                </style>
            `);
            for(const area of areas){
                area.parentNode.parentNode.parentNode.insertAdjacentHTML("afterEnd",`
                    <div>
                        <button class="data-copy-button">取得する</button>
                    </div>
                `);
                area.parentNode.parentNode.parentNode.nextElementSibling.getElementsByClassName("data-copy-button")[0].addEventListener("click",function(){
                    const obj = {
                        title:      area.parentNode.getElementsByClassName("css-1yskhqx")[0].innerHTML,
                        img:        area.parentNode.parentNode.parentNode.getElementsByClassName("chakra-image")[0].getAttribute("src"),
                        name:       area.getElementsByTagName("p")[0].innerHTML,
                        postnum1:    area.getElementsByTagName("p")[1].innerHTML.slice(2,5),
                        postnum2:    area.getElementsByTagName("p")[1].innerHTML.slice(-4),
                        prefecture: area.getElementsByTagName("p")[2].childNodes[0].nodeValue,
                        municipality:area.getElementsByTagName("p")[2].childNodes[1].nodeValue,
                        choume:     area.getElementsByTagName("p")[2].childNodes[2].nodeValue,
                        apart:     area.getElementsByTagName("p")[3].innerHTML
                    }
                    console.log(obj);
                    chrome.storage.local.get({
                        width: 640,
                        height: 480,
                        getMercariMoreMode: true
                    },function(items){
                        chrome.storage.local.set({
                            mercariRecentTrade :obj,
                            mercariGetMode: true
                        },function(){
                            console.log("保存完了");
                            if(items.getMercariMoreMode == true){
                                area.click();
                                getMercariMore();
                            }else{
                                let Window = window.open( chrome.runtime.getURL("popup.html"), "確認", `width=${items.width}, height=${items.height}, innerWidth=${items.width}, innerHeight=${items.height}`);
                            }
                        });
                    });
                });
            }
            for(const area of areas2){
                area.parentNode.parentNode.insertAdjacentHTML("afterEnd",`
                    <div>
                        <button class="data-copy-button">取得する</button>
                    </div>
                `);
                area.parentNode.parentNode.nextElementSibling.getElementsByClassName("data-copy-button")[0].addEventListener("click",function(){
                    const obj = {
                        title:      area.parentNode.getElementsByClassName("css-1v4xcoh")[0].getElementsByTagName("p")[0].innerHTML,
                        img:        area.parentNode.parentNode.getElementsByClassName("chakra-image")[0].getAttribute("src"),
                        name:       area.getElementsByTagName("p")[0].innerHTML,
                        postnum1:    area.getElementsByTagName("p")[1].innerHTML.slice(2,5),
                        postnum2:    area.getElementsByTagName("p")[1].innerHTML.slice(-4),
                        prefecture: area.getElementsByTagName("p")[2].childNodes[0].nodeValue,
                        municipality:area.getElementsByTagName("p")[2].childNodes[1].nodeValue,
                        choume:     area.getElementsByTagName("p")[2].childNodes[2].nodeValue,
                        apart:      area.getElementsByTagName("p")[3].innerHTML,
                        date:       area.parentNode.getElementsByClassName("css-t5zivr")[0].innerHTML,
                        id:         "取得できません",
                        price:      "取得できません"
                    }
                    console.log(obj);
                    chrome.storage.local.get({
                        width: 640,
                        height: 480,
                        getMercariMoreMode: true
                    },function(items){
                        chrome.storage.local.set({
                            mercariRecentTrade :obj,
                            mercariGetMode: true
                        },function(){
                            console.log("保存完了");
                            if(items.getMercariMoreMode == true){
                                area.click();
                                getMercariMore();
                            }else{
                                let Window = window.open( chrome.runtime.getURL("files/popupMercari.html"), "確認", `width=${items.width}, height=${items.height}, innerWidth=${items.width}, innerHeight=${items.height}`);
                            }
                        });
                    });
                });
            }
        }
    },300);
}
function getMercariMore(){
    chrome.storage.local.get({
        mercariGetMode: false,
        width: 640,
        height: 480,
        mercariRecentTrade: null,
        mercariPlaceholder: ""
    },function(items){
        if(items.mercariGetMode === true && items.mercariRecentTrade){
            //document.body.insertAdjacentHTML("beforeEnd",`<div id="nowgetingData" style="position:fixed;width:100%;height:100%;background-color:#fff;top:0;left:0;z-index:1100;"></div>`);
            const reloadMercari2  = setInterval(function(){
                const yen = document.getElementsByClassName("css-v597to")[0];
                if(yen){
                    clearInterval(reloadMercari2);
                    const obj = items.mercariRecentTrade;
                    obj.price = yen.innerHTML.replace(/[^0-9]/g, '');
                    const orderId = document.getElementsByClassName("css-fben2c")[0];
                    for(const qcl of document.getElementsByClassName("css-qcl2n8")){
                        if(qcl.innerHTML.includes("商品管理コード")){
                            obj.manageCode = qcl.getElementsByClassName("css-0")[0].innerHTML;
                            break;
                        }
                    }
                    if(orderId){
                        obj.id = orderId.innerHTML;
                    }
                    chrome.storage.local.set({
                        mercariRecentTrade: obj,
                        mercariGetMode: false
                    },function(){
                        console.log(obj);
                        if(document.getElementById("nowgetingData")) {
                            setTimeout(function(){
                            document.getElementById("nowgetingData").remove();
                            },1000);
                        }
                        let Window = window.open( chrome.runtime.getURL("files/popupMercari.html"), "確認", `width=${items.width}, height=${items.height}, innerWidth=${items.width}, innerHeight=${items.height}`);
                    });
                    if(items.mercariPlaceholder){
                        const textareas = document.getElementsByTagName("textarea");
                        for(const textarea of textareas){
                            if(textarea.getAttribute("placeholder") == "購入者へ連絡したい内容を入力してください"){
                                textarea.value = items.mercariPlaceholder;
                                break;
                            }
                        }
                    }
                }
                console.log("reloading");
            },400);
        }
    });
}

if(location.hostname == "mercari-shops.com"){
    setInterval(function(){
        if(location.href.includes("mercari-shops.com/seller/shops/") && location.href.includes("orders") && !location.href.includes("/orders/") && !location.href.includes("tab=completed") &&document.getElementsByClassName("data-copy-button").length == 0){
            getMercari();
        }
        console.log("checking...");
    },750);
}