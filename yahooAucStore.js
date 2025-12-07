const pagesBarMagicSelector = 'select[name="sortCondition"]';

function getPagesBar() {
    const pagesBar = document.querySelector(pagesBarMagicSelector)
        .parentElement.parentElement.parentElement.parentElement.parentElement;
    return pagesBar;
}

const EC_ASSIST_MENU_HTML = `
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
      <div style="border-bottom: 1px solid #888; border-top: 1px solid #888; padding: 5px 0; margin-bottom:5px;">
      <button disabled id="ecassist-zaikogire-onpage-btn">在庫切れ抽出（ページ指定）</button>
      （
          <div style="font-size: 13px; display: inline-block;">
              現在のページから
              <input type="number" id="ecassist-zaikogire-end" value="1" min="1" placeholder="1" style="width: 4em; height:16px;">ページ目まで
          </div>
      ）
      </div>
      <div>
          <button disabled id="ecassist-zaikogire-btn">在庫切れ抽出（すべてのページ）</button>
          <button disabled id="ecassist-akaji-btn">赤字商品抽出(未実装)</button>
      </div>
  </div>
`;


const LOG_AREA_HTML = `
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
`


console.log("yahooAucStore.js");


if (location.href.includes("https://auctions.store.yahoo.co.jp/serinavi/items")) {
    window.addEventListener("load", () => {
        insertCheckByCsvBtn();
    });
}

// loadgin中のエレメント。loadingじゃないときは、loadingWrapperしか表示されない。
// <div id="js-loadingWrapper">
//   <div class="sc-38bdf945-0 bNurIU">
//     <div class="sc-38bdf945-1 zJDVl">読み込み中</div>
//   </div>
// </div>

let extEndPage = 0;
//loadしたらajax確認して挿入
async function insertCheckByCsvBtn(cnt = 0) {
    // loadingマーク出てたら飛ばす
    // await sleep(3000);
    
    if (document.getElementById('js-loadingWrapper').children[0]) {
        console.log("extension skipped because of loading...");
        setTimeout(() => {
            insertCheckByCsvBtn();
        }, 1000);
        return;
    }
    if (cnt === 0) {
        setTimeout(() => {
            insertCheckByCsvBtn(1);
        }, 600);
        return;
    }
    // 挿入
    console.log("nowInsert");

    const pagesBar = getPagesBar();

    if (pagesBar === null) {
        return;
    }
    pagesBar.insertAdjacentHTML(
        "afterend",
        EC_ASSIST_MENU_HTML
    );
    let csvArray = [];
    let asinArray = [];
    document
        .getElementById("ecassist-haru-upload")
        .addEventListener("change", function() {
            if (
                document.getElementById("ecassist-haru-upload").files.length !== 1
            ) {
                console.log("No file selected");
                return;
            }
            let fileReader = new FileReader();
            fileReader.readAsText(
                document.getElementById("ecassist-haru-upload").files[0],
                "Shift-JIS"
            );
            fileReader.onload = () => {
                let fileResult = fileReader.result.split("\n");
                // 先頭行をヘッダとして格納
                let header = fileResult[0].slice(1, -1).split('","');
                console.log(header);
                // 先頭行の削除
                fileResult.shift();
                // CSVから情報を取得
                csvArray = fileResult.map((item) => {
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
                asinArray = csvArray.map((x) => x.ASINコード);
                console.log(asinArray);
                console.log(csvArray);
                if (asinArray[0] == undefined) {
                    alert("Error: HARU形式変更");
                    return;
                }
                // alert("CSVを読み込みました");
                document.getElementById("ecassist-zaikogire-btn").disabled = false;
                document.getElementById(
                    "ecassist-zaikogire-onpage-btn"
                ).disabled = false;
                document.getElementById("ecassist-akaji-btn").disabled = false;
            };
        });
    document
        .getElementById("ecassist-akaji-btn")
        .addEventListener("click", () => {
            if (confirm("赤字抽出を開始しますか？")) {
                if (csvArray.length < 2) {
                    alert("Error: CSVデータが不正です");
                    return;
                }
                //log areaを用意
                document.body.insertAdjacentHTML(
                    "beforeend",
                    LOG_AREA_HTML
                );
                //メインroutineに移行
                getMain(asinArray, csvArray, 1);
            }
        });
    document
        .getElementById("ecassist-zaikogire-btn")
        .addEventListener("click", () => {
            if (confirm("在庫切れ抽出（すべてのページ）を開始しますか？")) {
                if (csvArray.length < 2) {
                    alert("Error: CSVデータが不正です");
                    return;
                }
                //log areaを用意
                document.body.insertAdjacentHTML(
                    "beforeend",
                    LOG_AREA_HTML
                );
                //メインroutineに移行
                getMain(asinArray, csvArray, 0);
            }
        });
    document
        .getElementById("ecassist-zaikogire-onpage-btn")
        .addEventListener("click", () => {
            if (confirm("在庫切れ抽出（ページ指定）を開始しますか？")) {
                if (csvArray.length < 2) {
                    alert("Error: CSVデータが不正です");
                    return;
                }
                //log areaを用意
                document.body.insertAdjacentHTML(
                    "beforeend",
                    LOG_AREA_HTML
                );
                //メインroutineに移行
                extEndPage = Number(
                    document.getElementById("ecassist-zaikogire-end").value
                );
                getMain(asinArray, csvArray, 2);
            }
        });

}


//メイン
let logcsv = `"抽出ASIN","適正ASIN(1:適正 0:不適正)","HARU該当(1: 該当あり 0: 該当なし)","HARU在庫アラート","HARU Amazon最新価格","ヤフオク出品価格","収支(マイナスで赤字)"\n`;

async function getMain(asinArray, csvArray, domode) {
    console.log({
        domode
    });

    const storageItems = await getLocalStorage();
    console.log(storageItems);

    if (
        document
        .getElementsByTagName("body")[0]
        .querySelectorAll(".sc-38bdf945-1.zJDVl").length > 0
    ) {
        console.log("extension skipped because of loading");
        setTimeout(() => {
            getMain(asinArray, csvArray, domode);
        }, storageItems.yahooAucIntervalTime);
        return;
    }
    const table = document
        .getElementsByTagName("body")[0]
        .querySelector(
            "main > div > div:has(>div) > div:has(ul>li>label>div>label>input)"
        );
    if (!table) {
        alert("Error: notable");
        return;
    }
    //進捗表示

    const nowCounterArray = [
        ...getPager("件を表示しています", document.getElementsByTagName('p'))
        .querySelectorAll(":scope > div:nth-child(1) > div > p"),
    ].map((x) => x.innerText);

    console.log(nowCounterArray);

    document.getElementById("ecassist-message-area").innerHTML = `進捗: ${
      Math.floor(
        (Number(nowCounterArray[1].split("〜")[0].replace(/[^0-9]/g, "")) /
          Number(nowCounterArray[0].replace(/[^0-9]/g, ""))) *
          1000
      ) / 10
    } %`;

    console.log(table);

    //tableから行データを抜き出す
    for (const ul of table.querySelectorAll(
            "ul:has(li input[type='checkbox'])"
        )) {
        const kanriNode = ul
            .querySelectorAll(":scope > li")[4]
            .querySelector("p:nth-child(2)");
        const kakakuNode = ul
            .querySelectorAll(":scope > li")[5]
            .querySelector("p:nth-child(2)");

        if (!kanriNode) continue; 
        
        const asin = kanriNode.innerHTML.slice(-10);
        // console.log(asin);
        // console.log(
        //   "価格 > " + kakakuNode.innerHTML.replace(/[^0-9]/g, "")
        // );
        //asinチェック
        if (asin && asin.length === 10 && /^[A-Z0-9]*$/.test(asin)) {
            // console.log("正しいASIN");
        } else {
            // console.log("不正なASIN");
            logcsv += `"${asin}","0","","","","",""\n`;
            continue;
        }
        const asinContainNum = asinArray.indexOf(asin);
        if (asinContainNum < 0) {
            //見つからなかった場合
            // console.log("> 該当なし");
            logcsv += `"${asin}","1","0","","","",""\n`;
        } else {
            // console.log("> " + csvArray[asinContainNum]["ASINコード"]);
            // console.log(
            //   "> " +
            //     csvArray[asinContainNum][
            //       "在庫ワード-アラート(0:アラート or 1:なし)"
            //     ]
            // );
            logcsv += `"${asin}","1","1","${
                          csvArray[asinContainNum][
                            "在庫ワード-アラート(0:アラート or 1:なし)"
                          ]
                        }","${
                          csvArray[asinContainNum]["Amazon最新価格1"]
                        }","${kakakuNode.innerHTML.match(/[0-9,]+円/g)[0].replace(/[^0-9]/g, "")}","${
                          Number(
                            kakakuNode.innerHTML
                              .match(/[0-9,]+円/g)[0]
                              .replace(/[^0-9]/g, "")
                          ) * 0.9 - Number(csvArray[asinContainNum]["Amazon最新価格1"])
                        }"\n`;

            if (
                (domode == 0 || domode == 2) &&
                csvArray[asinContainNum][
                    "在庫ワード-アラート(0:アラート or 1:なし)"
                ] == "0"
            ) {
                //在庫なかったらcheck
                ul.querySelectorAll(":scope > li")[0]
                    .querySelector("label")
                    .click();
            } else if (
                domode == 1 &&
                Number(kakakuNode.innerText.replace(/[^0-9]/g, "")) * 0.9 -
                Number(csvArray[asinContainNum]["Amazon最新価格1"]) <=
                0
            ) {
                console.log(
                    Number(kakakuNode.innerText.replace(/[^0-9]/g, "")) * 0.9 -
                    Number(csvArray[asinContainNum]["Amazon最新価格1"]) <=
                    0
                );
                //赤字だったらcheck
                ul.querySelectorAll(":scope > li")[0]
                    .querySelector("label")
                    .click();
            }
        }
    } // for END






    //次ボタンを押す
    const nextButton = [
        ...getPager("件を表示しています", document.getElementsByTagName('p'))
        .querySelectorAll(":scope > div > div > div > a"),
    ].filter((link) => link.innerText.trim() === "次")?.[0];

    const nowPage = Number( ( location.href.match(/page=([0-9]+)/) && location.href.match(/page=([0-9]+)/)[1]) || 1 );

    if (domode < 2 && nextButton) {
        // await sleep(100);
        setTimeout(() => {
            nextButton.click();
        }, 100);
        setTimeout(() => {
            getMain(asinArray, csvArray, domode);
        }, storageItems.yahooAucIntervalTime);
    } else if ( domode == 2 && nextButton && extEndPage > 1 && nowPage < extEndPage ) {
        setTimeout(() => {
            nextButton.click();
        }, 100);
        setTimeout(() => {
            getMain(asinArray, csvArray, domode);
        }, storageItems.yahooAucIntervalTime);
    } else {
        //CSVのバイナリデータを作る
        makeCSV(logcsv) ;
        atattchCloseBtn2Modal();
    }
}



// .querySelectorAll(":scope > div:nth-child(1) > div > p"),

function atattchCloseBtn2Modal() {
  document.getElementById("ecassist-message-area").innerHTML =
    '<strong>取得完了しました。</strong><button id="ecassist-closeModal">閉じる</button>';
  document
    .getElementById("ecassist-closeModal")
    .addEventListener("click", function() {
        document.getElementById("ecassist-overlay").style.display =
            "none";
    });
}



function makeCSV(logcsv) {
  let blob = new Blob(
    [
        new Uint8Array(
            Encoding.convert(
                Encoding.stringToCode(logcsv),
                "sjis",
                "unicode"
            )
        ),
    ], {
        type: "text/csv"
    }
  );
  let uri = URL.createObjectURL(blob);
  // ダウンロードリンクを 生成
  let dlLink = document.createElement("a");
  // blob から URL を生成
  dlLink.href = uri;
  dlLink.download = `yahooAuctionLog-${new Date().getFullYear()}_${
                        new Date().getMonth() + 1
                      }_${new Date().getDate()}-${new Date().getHours()}_${new Date().getMinutes()}.csv`;
  // 設置/クリック/削除
  document.body.insertAdjacentElement("beforeEnd", dlLink);
  dlLink.click();
  dlLink.remove();

  // オブジェクト URL の開放
  setTimeout(function() {
      window.URL.revokeObjectURL(uri);
  }, 1000);

}

function getPager(text, candidates) {
    for (let i = 0; i < candidates.length; i++) {
        if (!candidates[i].children[0] && candidates[i].parentElement.innerText.match(text)) {
            // return candidates[i].parentElement;
            return candidates[i].parentElement.parentElement.parentElement;
        }
    }
    return "取得できませんでした。";
}



function getLocalStorage() {
  return new Promise( async (resolve, reject) => {
    chrome.storage.local.get({
      yahooAucIntervalTime: 3000,
    },function(storageItems) {
      resolve(storageItems)
    });
  });
}



function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}