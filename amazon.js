
const TIME_OUT = 9999;

const ADDRES_KAKUTEI_BTN_ID = `[data-csa-c-slot-id="address-ui-widgets-continue-address-btn-bottom"]`;


// function addresAutoInput(func) {
//     console.log(`func: ${func.name}`);
//     const intervalCheck = setInterval(function(){
//         if(document.getElementById("add-new-address-desktop-sasp-tango-link")){
//             clearInterval(intervalCheck);
//             func(true);
//         }
//     },300);
// }



// //amazonだったら
// if(location.href.includes("https://www.amazon.co.jp/gp/buy/gift/handlers/")||location.href.includes("https://www.amazon.co.jp/gp/buy/spc/handlers/")||location.href.includes("https://www.amazon.co.jp/gp/buy/addressselect/handlers/")||location.href.includes("https://www.amazon.co.jp/gp/buy/payselect/handlers/")){
//     //ボタン挿入自動化
//     console.log("AMAZON");
//     const addressChangeLinkId = document.getElementById("addressChangeLinkId");
//     if(addressChangeLinkId){
//         addressChangeLinkId.insertAdjacentHTML("afterend",`
//             <div><a href="javascript:void(0);" id="auctownAddressBtn" class="a-button a-button-primary a-spacing-micro">保存住所<br>(オークタウン)</a></div>
//             <div><a href="javascript:void(0);" id="mercariAddressBtn" class="a-button a-button-primary a-spacing-micro">保存住所<br>(メルカリ)</a></div>
//             <div><a href="javascript:void(0);" id="clipboardAddressBtn" class="a-button a-button-primary a-spacing-micro">保存住所<br>(クリップボード)</a></div>
//         `);
//         document.getElementById("auctownAddressBtn").addEventListener("click",function(){
//             addresAutoInput(auctownAutoInput);
//         });
//         document.getElementById("mercariAddressBtn").addEventListener("click",function(){
//             mercariAutoInput(mercariAutoInput);
//         });
//         document.getElementById("clipboardAddressBtn").addEventListener("click",function(){
//             mercariAutoInput(clipxboardAutoInput);
//         });
//     }

//amazonだったら
if(location.href.includes("https://www.amazon.co.jp/gp/buy/gift/handlers/")||location.href.includes("https://www.amazon.co.jp/gp/buy/spc/handlers/")||location.href.includes("https://www.amazon.co.jp/gp/buy/addressselect/handlers/")||location.href.includes("https://www.amazon.co.jp/gp/buy/payselect/handlers/")||location.href.includes("https://www.amazon.co.jp/checkout/")){
    //ボタン挿入自動化
    console.log("AMAZON");
    const addressChangeLinkId = document.querySelector('[aria-label="お届け先住所を変更"]');
    if(addressChangeLinkId){
        addressChangeLinkId.insertAdjacentHTML("afterend",`
            <div><a href="javascript:void(0);" id="auctownAddressBtn" class="a-button a-button-primary a-spacing-micro">保存住所<br>(オークタウン)</a></div>
            <div><a href="javascript:void(0);" id="mercariAddressBtn" class="a-button a-button-primary a-spacing-micro">保存住所<br>(メルカリ)</a></div>
            <div><a href="javascript:void(0);" id="clipboardAddressBtn" class="a-button a-button-primary a-spacing-micro">保存住所<br>(クリップボード)</a></div>
        `);
        document.getElementById("auctownAddressBtn").addEventListener("click",function(){
            const intervalCheck = setInterval(function(){
                if(document.getElementById("add-new-address-desktop-sasp-tango-link")){
                    clearInterval(intervalCheck);
                    auctownAutoInput(true);
                }
            },300);
        });
        document.getElementById("mercariAddressBtn").addEventListener("click",function(){
            const intervalCheck = setInterval(function(){
                if(document.getElementById("add-new-address-desktop-sasp-tango-link")){
                    clearInterval(intervalCheck);
                    mercariAutoInput(true);
                }
            },300);
        });
        document.getElementById("clipboardAddressBtn").addEventListener("click",function(){
            console.log("clicked");
            const intervalCheck = setInterval(async function(){
                if(document.getElementById("add-new-address-desktop-sasp-tango-link")){
                    clearInterval(intervalCheck);
                    document.getElementById("add-new-address-desktop-sasp-tango-link").click();
                    await waitForElement("#address-ui-widgets-enterAddressPhoneNumber");
                    clipboardAutoInput(true);
                }
            },300);
        });
    }
    //ボタン挿入
    const checkLocation = setInterval(function(){
        const addressForm = document.getElementById("address-ui-widgets-enterAddressFormContainer");
        if(addressForm){
            clearInterval(checkLocation);
            if(addressForm.getElementsByClassName("a-row")[0]){
                addressForm.getElementsByClassName("a-row")[0].insertAdjacentHTML("beforeBegin",`
                    <div>
                    <div style="margin-top:10px;" id="lastAuctownData"><span class="a-button a-button-primary"><span class="a-button-inner"><input class="a-button-input"><span class="a-button-text" aria-hidden="true">ブラウザ保存のデータ(オークタウン)</span></span></span></div>
                    <div style="margin-top:10px;" id="lastMercariData"><span class="a-button a-button-primary"><span class="a-button-inner"><input class="a-button-input"><span class="a-button-text" aria-hidden="true">ブラウザ保存のデータ(メルカリ)</span></span></span></div>
                    <div style="margin-top:10px;" id="lastClipboardData"><span class="a-button a-button-primary"><span class="a-button-inner"><input class="a-button-input"><span class="a-button-text" aria-hidden="true">クリップボード保存のデータ</span></span></span></div>
                    <!--a href="javascript:void(0)" style="display: block;width: fit-content;padding: 10px 30px 5px 5px;margin: 0;">オークタウンのデータ一覧</a-->
                    </div>
                `);
                document.getElementById("lastAuctownData").addEventListener("click", () => {auctownAutoInput(false);});
                document.getElementById("lastMercariData").addEventListener("click", () => {mercariAutoInput(false);});
                document.getElementById("lastClipboardData").addEventListener("click", () => {clipboardAutoInput(false);});
            }
        }
    },1000);
}

async function auctownAutoInput(autoSub){
    chrome.storage.local.get({
        recentTrade: null,
        tradeDataList: [],
        phoneNum: "000-0000-0000"
    }, async function(items){
        if(items.recentTrade != null && items.tradeDataList.length > 0){
            console.log(items.recentTrade);
            const [phoneArea, nameArea, postArea1, postArea2, postArea, prefectureArea, municipalityArea, choume, apartName, unitNum] = getAllInputElem();

            if(phoneArea && nameArea  && prefectureArea && municipalityArea && choume && apartName && unitNum && (postArea || (postArea1 && postArea2))){
                //電話番号
                phoneArea.value = items.phoneNum;
                //氏名
                nameArea.value = items.recentTrade.name;
                //郵便番号
                if(postArea1 && postArea2){
                    postArea1.value = items.recentTrade.postnum1;
                    postArea2.value = items.recentTrade.postnum2;
                }else{
                    postArea.value = items.recentTrade.postnum1 + "-" + items.recentTrade.postnum2;
                }
                //都道府県
                prefectureArea.value = items.recentTrade.prefecture;
                //市町村
                municipalityArea.value = items.recentTrade.municipality;
                //丁目・番地
                choume.value = items.recentTrade.choume;
                apartName.value = items.recentTrade.apart;
                await clickUseThisAddressBtn(autoSub);
            }else{
                alert("入力欄が存在しません");
            }
        }else{
            alert("データが存在しません");
            // if(autoSub){
            //     document.getElementById("add-new-address-desktop-sasp-tango-link").click();
            // }
        }
    });
}

async function mercariAutoInput(autoSub){
    chrome.storage.local.get({
        mercariRecentTrade: null,
        tradeDataList: [],
        phoneNum: "000-0000-0000"
    }, async function(items){
        if(items.mercariRecentTrade != null && items.tradeDataList.length > 0){
            console.log(items.mercariRecentTrade);
            const [phoneArea, nameArea, postArea1, postArea2, postArea, prefectureArea, municipalityArea, choume, apartName, unitNum] = getAllInputElem();

            if(phoneArea && nameArea  && prefectureArea && municipalityArea && choume && apartName && unitNum && (postArea || (postArea1 && postArea2))){
                //電話番号
                phoneArea.value = items.phoneNum;
                //氏名
                nameArea.value = items.mercariRecentTrade.name;
                //郵便番号
                if(postArea1 && postArea2){
                    postArea1.value = items.mercariRecentTrade.postnum1;
                    postArea2.value = items.mercariRecentTrade.postnum2;
                }else{
                    postArea.value = items.mercariRecentTrade.postnum1 + "-" + items.mercariRecentTrade.postnum2;
                }
                //都道府県
                prefectureArea.value = items.mercariRecentTrade.prefecture;
                //市町村
                municipalityArea.value = items.mercariRecentTrade.municipality;
                //丁目・番地
                choume.value = items.mercariRecentTrade.choume;
                apartName.value = items.mercariRecentTrade.apart;
                await clickUseThisAddressBtn(autoSub);

            }else{
                alert("入力欄が存在しません");
            }
        }else{
            alert("データが存在しません");
            if(autoSub){
                document.getElementById("add-new-address-desktop-sasp-tango-link").click();
            }
        }
    });
}

async function clipboardAutoInput(autoSub){
    console.log("clipboaxrdAutoInput", {autoSub});
    chrome.storage.local.get({
        phoneNum: '000-0000-0000'
    }, async function(items){
        navigator.clipboard.readText()
        .then(async (text) => {
            console.log('ペーストされたテキスト: ', text);
            let jsonOK = true;
            try {
                JSON.parse(text);
            } catch (error) {
                jsonOK = false;
                alert('メルカリShopsかオークタウン、ヤフーのポップアップウィンドウからコピーしてください。');
                // if(autoSub){
                //     document.getElementById("add-new-address-desktop-sasp-tango-link").click();
                // }
            }
            if(jsonOK){
                const data = JSON.parse(text);
                const [phoneArea, nameArea, postArea1, postArea2, postArea, prefectureArea, municipalityArea, choume, apartName, unitNum] = getAllInputElem();

                if(phoneArea && nameArea  && prefectureArea && municipalityArea && choume && apartName && unitNum && (postArea || (postArea1 && postArea2))){
                    //電話番号
                    // phoneArea.value = data.tel || items.phoneNum;
                    phoneArea.value = data.phoneNum;
                    //氏名
                    nameArea.value = data.name;
                    //郵便番号
                    if(postArea1 && postArea2){
                        postArea1.value = data.postnum1;
                        postArea2.value = data.postnum2;
                    }else{
                        postArea.value = data.postnum1 + "-" + data.postnum2;
                    }
                    //都道府県
                    prefectureArea.value = data.prefecture;
                    //市町村
                    municipalityArea.value = data.municipality;
                    //丁目・番地
                    choume.value = data.choume;
                    apartName.value = data.apart;
                    await clickUseThisAddressBtn(autoSub);
                }else{
                    alert("入力欄が存在しません");
                }
            }
        })
        .catch(err => {
            console.error('ユーザが拒否、もしくはなんらかの理由で失敗', err);
            alert('クリップボードへのアクセスを許可してください');
        });
    });
}


async function clickUseThisAddressBtn(autoSub) {
    if(autoSub){
        await waitForElement(ADDRES_KAKUTEI_BTN_ID);
        if ( document.querySelector(ADDRES_KAKUTEI_BTN_ID) ){
            document.querySelector(ADDRES_KAKUTEI_BTN_ID).click();
        } else {
            console.log("この住所を使用ボタンが見つかりません。");
        }
    }
}


function getAllInputElem() {
    const phoneArea = document.getElementById("address-ui-widgets-enterAddressPhoneNumber");
    const nameArea = document.getElementById("address-ui-widgets-enterAddressFullName");
    const postArea1 = document.getElementById("address-ui-widgets-enterAddressPostalCodeOne");
    const postArea2 = document.getElementById("address-ui-widgets-enterAddressPostalCodeTwo");
    const postArea = document.getElementById("address-ui-widgets-enterAddressPostalCode");
    const prefectureArea = document.getElementById("address-ui-widgets-enterAddressStateOrRegion-dropdown-nativeId");
    const municipalityArea = document.getElementById("address-ui-widgets-enterAddressLine1");
    const choume = document.getElementById("address-ui-widgets-enterAddressLine2");
    const apartName = document.getElementById("address-ui-widgets-enterBuildingOrCompanyName");
    const unitNum = document.getElementById("address-ui-widgets-enterUnitOrRoomNumber");

    return [phoneArea, nameArea, postArea1, postArea2, postArea, prefectureArea, municipalityArea, choume, apartName, unitNum];
}




async function waitForElement(target, timeout = TIME_OUT) {
    // console.log("wait start", target);
    const interval = 100; // チェック間隔（ミリ秒）
    const endTime = Date.now() + timeout;

    while (Date.now() < endTime) {
        let element;

        if (typeof target === 'string') {
            // targetがCSSセレクタの場合
            element = document.querySelector(target);
        } else {
            // targetがエレメントの場合
            element = document.body.contains(target) ? target : null;
        } 

        if (element) {
            console.log("wait fin");
            return element;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error(`Timeout: Element with target "${target}" not found or not present in DOM.`);
}