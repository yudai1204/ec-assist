//amazonだったら
if(location.href.includes("https://www.amazon.co.jp/gp/buy/gift/handlers/")||location.href.includes("https://www.amazon.co.jp/gp/buy/spc/handlers/")||location.href.includes("https://www.amazon.co.jp/gp/buy/addressselect/handlers/")||location.href.includes("https://www.amazon.co.jp/gp/buy/payselect/handlers/")){
    //ボタン挿入自動化
    console.log("AMAZON");
    const addressChangeLinkId = document.getElementById("addressChangeLinkId");
    if(addressChangeLinkId){
        addressChangeLinkId.insertAdjacentHTML("afterend",`
            <div><a href="javascript:void(0);" id="auctownAddressBtn" class="a-button a-button-primary a-spacing-micro">保存住所<br>(オークタウン)</a></div>
            <div><a href="javascript:void(0);" id="mercariAddressBtn" class="a-button a-button-primary a-spacing-micro">保存住所<br>(メルカリ)</a></div>
            <div><a href="javascript:void(0);" id="clipboardAddressBtn" class="a-button a-button-primary a-spacing-micro">保存住所<br>(クリップボード)</a></div>
        `);
        document.getElementById("auctownAddressBtn").addEventListener("click",function(){
            const intervalCheck = setInterval(function(){
                if(document.getElementById("address-ui-widgets-form-submit-button")){
                    clearInterval(intervalCheck);
                    auctownAutoInput(true);
                }
            },300);
        });
        document.getElementById("mercariAddressBtn").addEventListener("click",function(){
            const intervalCheck = setInterval(function(){
                if(document.getElementById("address-ui-widgets-form-submit-button")){
                    clearInterval(intervalCheck);
                    mercariAutoInput(true);
                }
            },300);
        });
        document.getElementById("clipboardAddressBtn").addEventListener("click",function(){
            const intervalCheck = setInterval(function(){
                if(document.getElementById("address-ui-widgets-form-submit-button")){
                    clearInterval(intervalCheck);
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

function auctownAutoInput(autoSub){
    chrome.storage.local.get({
        recentTrade: null,
        tradeDataList: [],
        phoneNum: "000-0000-0000"
    },function(items){
        if(items.recentTrade != null && items.tradeDataList.length > 0){
            console.log(items.recentTrade);
            const phoneArea        = document.getElementById("address-ui-widgets-enterAddressPhoneNumber");
            const nameArea         = document.getElementById("address-ui-widgets-enterAddressFullName");
            const postArea1        = document.getElementById("address-ui-widgets-enterAddressPostalCodeOne");
            const postArea2        = document.getElementById("address-ui-widgets-enterAddressPostalCodeTwo");
            const prefectureArea   = document.getElementById("address-ui-widgets-enterAddressStateOrRegion-dropdown-nativeId");
            const municipalityArea = document.getElementById("address-ui-widgets-enterAddressLine1");
            const choume           = document.getElementById("address-ui-widgets-enterAddressLine2");
            const apartName        = document.getElementById("address-ui-widgets-enterBuildingOrCompanyName");
            const unitNum          = document.getElementById("address-ui-widgets-enterUnitOrRoomNumber");
            if(phoneArea && nameArea && postArea1 && postArea2 && prefectureArea && municipalityArea && choume && apartName && unitNum){
                //電話番号
                phoneArea.value = items.phoneNum;
                //氏名
                nameArea.value = items.recentTrade.name;
                //郵便番号
                postArea1.value = items.recentTrade.postnum1;
                postArea2.value = items.recentTrade.postnum2;
                //都道府県
                prefectureArea.value = items.recentTrade.prefecture;
                //市町村
                municipalityArea.value = items.recentTrade.municipality;
                //丁目・番地
                choume.value = items.recentTrade.choume;
                apartName.value = items.recentTrade.apart;
                if(autoSub){
                    if ( document.getElementById("address-ui-widgets-form-submit-button") ){
                        document.getElementById("address-ui-widgets-form-submit-button").click();
                    }
                }
            }else{
                alert("入力欄が存在しません");
            }
        }else{
            alert("データが存在しません");
            if(autoSub){
                document.getElementById("add-new-address-popover-link").click();
            }
        }
    });
}

function mercariAutoInput(autoSub){
    chrome.storage.local.get({
        mercariRecentTrade: null,
        tradeDataList: [],
        phoneNum: "000-0000-0000"
    },function(items){
        if(items.mercariRecentTrade != null && items.tradeDataList.length > 0){
            console.log(items.mercariRecentTrade);
            const phoneArea        = document.getElementById("address-ui-widgets-enterAddressPhoneNumber");
            const nameArea         = document.getElementById("address-ui-widgets-enterAddressFullName");
            const postArea1        = document.getElementById("address-ui-widgets-enterAddressPostalCodeOne");
            const postArea2        = document.getElementById("address-ui-widgets-enterAddressPostalCodeTwo");
            const prefectureArea   = document.getElementById("address-ui-widgets-enterAddressStateOrRegion-dropdown-nativeId");
            const municipalityArea = document.getElementById("address-ui-widgets-enterAddressLine1");
            const choume           = document.getElementById("address-ui-widgets-enterAddressLine2");
            const apartName        = document.getElementById("address-ui-widgets-enterBuildingOrCompanyName");
            const unitNum          = document.getElementById("address-ui-widgets-enterUnitOrRoomNumber");
            if(phoneArea && nameArea && postArea1 && postArea2 && prefectureArea && municipalityArea && choume && apartName && unitNum){
                //電話番号
                phoneArea.value = items.phoneNum;
                //氏名
                nameArea.value = items.mercariRecentTrade.name;
                //郵便番号
                postArea1.value = items.mercariRecentTrade.postnum1;
                postArea2.value = items.mercariRecentTrade.postnum2;
                //都道府県
                prefectureArea.value = items.mercariRecentTrade.prefecture;
                //市町村
                municipalityArea.value = items.mercariRecentTrade.municipality;
                //丁目・番地
                choume.value = items.mercariRecentTrade.choume;
                apartName.value = items.mercariRecentTrade.apart;
                if(autoSub){
                    if ( document.getElementById("address-ui-widgets-form-submit-button") ){
                        document.getElementById("address-ui-widgets-form-submit-button").click();
                    }
                }
            }else{
                alert("入力欄が存在しません");
            }
        }else{
            alert("データが存在しません");
            if(autoSub){
                document.getElementById("add-new-address-popover-link").click();
            }
        }
    });
}

function clipboardAutoInput(autoSub){
    chrome.storage.local.get({
        phoneNum: '000-0000-0000'
    },function(items){
        navigator.clipboard.readText()
        .then((text) => {
            console.log('ペーストされたテキスト: ', text);
            let jsonOK = true;
            try {
                JSON.parse(text);
            } catch (error) {
                jsonOK = false;
                alert('メルカリShopsかオークタウン、ヤフーのポップアップウィンドウからコピーしてください。');
                if(autoSub){
                    document.getElementById("add-new-address-popover-link").click();
                }
            }
            if(jsonOK){
                const data = JSON.parse(text);
                const phoneArea        = document.getElementById("address-ui-widgets-enterAddressPhoneNumber");
                const nameArea         = document.getElementById("address-ui-widgets-enterAddressFullName");
                const postArea1        = document.getElementById("address-ui-widgets-enterAddressPostalCodeOne");
                const postArea2        = document.getElementById("address-ui-widgets-enterAddressPostalCodeTwo");
                const prefectureArea   = document.getElementById("address-ui-widgets-enterAddressStateOrRegion-dropdown-nativeId");
                const municipalityArea = document.getElementById("address-ui-widgets-enterAddressLine1");
                const choume           = document.getElementById("address-ui-widgets-enterAddressLine2");
                const apartName        = document.getElementById("address-ui-widgets-enterBuildingOrCompanyName");
                const unitNum          = document.getElementById("address-ui-widgets-enterUnitOrRoomNumber");
                if(phoneArea && nameArea && postArea1 && postArea2 && prefectureArea && municipalityArea && choume && apartName && unitNum){
                    //電話番号
                    phoneArea.value = data.tel || items.phoneNum;
                    //氏名
                    nameArea.value = data.name;
                    //郵便番号
                    postArea1.value = data.postnum1;
                    postArea2.value = data.postnum2;
                    //都道府県
                    prefectureArea.value = data.prefecture;
                    //市町村
                    municipalityArea.value = data.municipality;
                    //丁目・番地
                    choume.value = data.choume;
                    apartName.value = data.apart;
                    if(autoSub){
                        if ( document.getElementById("address-ui-widgets-form-submit-button") ){
                            document.getElementById("address-ui-widgets-form-submit-button").click();
                        }
                    }
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