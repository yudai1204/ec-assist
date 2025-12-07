function getMercari() {
  const reloadMercari = setInterval(() => {
    const areas = document.getElementsByClassName("css-1ozxtjg");
    const areas2 = document.getElementsByClassName("css-hbn72w");
    console.log(areas.length);
    if (areas.length + areas2.length > 0) {
      clearInterval(reloadMercari);
      if (document.getElementsByClassName("data-copy-button").length > 0)
        return;
      document.head.insertAdjacentHTML(
        "beforeend",
        `
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
            `
      );
      for (const area of areas) {
        area.parentNode.parentNode.parentNode.insertAdjacentHTML(
          "afterEnd",
          `
                    <div>
                        <a href="javascript:void(0)" class="data-copy-button">取得する</a>
                    </div>
                `
        );
        area.parentNode.parentNode.parentNode.nextElementSibling
          .getElementsByClassName("data-copy-button")[0]
          .addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            const obj = {
              title:
                area.parentNode.getElementsByClassName("css-1yskhqx")[0]
                  .innerHTML,
              img: area.parentNode.parentNode.parentNode
                .getElementsByClassName("chakra-image")[0]
                .getAttribute("src"),
              name: area.getElementsByTagName("p")[0].innerHTML,
              postnum1: area.getElementsByTagName("p")[1].innerHTML.slice(2, 5),
              postnum2: area.getElementsByTagName("p")[1].innerHTML.slice(-4),
              prefecture:
                area.getElementsByTagName("p")[2].childNodes[0].nodeValue,
              municipality:
                area.getElementsByTagName("p")[2].childNodes[1].nodeValue,
              choume: area.getElementsByTagName("p")[2].childNodes[2].nodeValue,
              apart: area.getElementsByTagName("p")[3].innerHTML,
            };
            console.log(obj);
            chrome.storage.local.get(
              {
                width: 640,
                height: 480,
                getMercariMoreMode: true,
              },
              function (items) {
                chrome.storage.local.set(
                  {
                    mercariRecentTrade: obj,
                    mercariGetMode: true,
                  },
                  function () {
                    console.log("保存完了");
                    if (items.getMercariMoreMode == true) {
                      area.click();
                    } else {
                      let Window = window.open(
                        chrome.runtime.getURL("popup.html"),
                        "確認",
                        `width=${items.width}, height=${items.height}, innerWidth=${items.width}, innerHeight=${items.height}`
                      );
                    }
                  }
                );
              }
            );
          });
      }
      for (const area of areas2) {
        area.parentNode.parentNode.insertAdjacentHTML(
          "afterEnd",
          `
                    <div>
                        <button class="data-copy-button">取得する</button>
                    </div>
                `
        );
        area.parentNode.parentNode.nextElementSibling
          .getElementsByClassName("data-copy-button")[0]
          .addEventListener("click", function () {
            const obj = {
              title: area.parentNode
                .getElementsByClassName("css-1v4xcoh")[0]
                .getElementsByTagName("p")[0].innerHTML,
              img: area.parentNode.parentNode
                .getElementsByClassName("chakra-image")[0]
                .getAttribute("src"),
              name: area.getElementsByTagName("p")[0].innerHTML,
              postnum1: area.getElementsByTagName("p")[1].innerHTML.slice(2, 5),
              postnum2: area.getElementsByTagName("p")[1].innerHTML.slice(-4),
              prefecture:
                area.getElementsByTagName("p")[2].childNodes[0].nodeValue,
              municipality:
                area.getElementsByTagName("p")[2].childNodes[1].nodeValue,
              choume: area.getElementsByTagName("p")[2].childNodes[2].nodeValue,
              apart: area.getElementsByTagName("p")[3].innerHTML,
              date: area.parentNode.getElementsByClassName("css-t5zivr")[0]
                .innerHTML,
              id: "取得できません",
              price: "取得できません",
            };
            console.log(obj);
            chrome.storage.local.get(
              {
                width: 640,
                height: 480,
                getMercariMoreMode: true,
              },
              function (items) {
                chrome.storage.local.set(
                  {
                    mercariRecentTrade: obj,
                    mercariGetMode: true,
                  },
                  function () {
                    console.log("保存完了");
                    if (items.getMercariMoreMode == true) {
                      area.click();
                    } else {
                      let Window = window.open(
                        chrome.runtime.getURL("files/popupMercari.html"),
                        "確認",
                        `width=${items.width}, height=${items.height}, innerWidth=${items.width}, innerHeight=${items.height}`
                      );
                    }
                  }
                );
              }
            );
          });
      }
    }
  }, 300);
}
function getMercariMore() {
  chrome.storage.local.get(
    {
      mercariGetMode: false,
      width: 640,
      height: 480,
      mercariRecentTrade: null,
      mercariPlaceholder: "",
    },
    function (items) {
      if (items.mercariGetMode === true && items.mercariRecentTrade) {
        //document.body.insertAdjacentHTML("beforeEnd",`<div id="nowgetingData" style="position:fixed;width:100%;height:100%;background-color:#fff;top:0;left:0;z-index:1100;"></div>`);
        const reloadMercari2 = setInterval(function () {
          const informationList = [
            ...document.querySelectorAll(
              'div:not(:has([data-testid="buyer-info"])) ul:nth-child(1) li:has([data-testid="select-payment-method"])'
            ),
          ];

          const yen = informationList.find((item) =>
            item?.innerText?.includes("商品代金")
          );

          console.log(yen);

          if (yen) {
            clearInterval(reloadMercari2);
            const obj = items.mercariRecentTrade;
            obj.price = yen
              .querySelector("div:not(:has([class^='chakra-']))")
              .innerText.replace(/[^0-9]/g, "");

            console.log(obj.price);

            const orderId = [
              ...informationList
                .find((item) => item?.innerText?.includes("注文番号"))
                ?.querySelectorAll(".chakra-text"),
            ].find((item) => item?.innerText?.startsWith("order_"))?.innerText;

            console.log(orderId);

            obj.manageCode = informationList
              .find((item) => item?.innerText?.includes("商品管理コード"))
              ?.querySelector("div:not(:has([class^='chakra-']))")?.innerText;

            console.log(obj.manageCode);

            // https://mercari-shops.com/seller/shops/jW4jco98UZswPS5H2hg8Gn/orders/53xQZVy8TgWjyqoZQw4ZeZ のようなページで、「購入者」や「取引情報」エリアの情報を取得する。
            function getTargetInfo(text, candidates) {
              for (let i = 0; i < candidates.length; i++) {
                if (candidates[i].innerText.match(text)) {
                  return candidates[i].innerText.split(text)[1];
                }
              }
              return "取得できませんでした。";
            }

            const buyerInfoUl = document.querySelector(
              '[data-testid="buyer-info"]'
            ).parentElement;
            const candidates = buyerInfoUl.querySelectorAll("li");
            obj.phoneNum = getTargetInfo("電話番号", candidates).replace(
              /\s/gm,
              ""
            );

            if (orderId) {
              obj.id = orderId;
            }

            chrome.storage.local.set(
              {
                mercariRecentTrade: obj,
                mercariGetMode: false,
              },
              function () {
                console.log(obj);
                if (document.getElementById("nowgetingData")) {
                  setTimeout(function () {
                    document.getElementById("nowgetingData").remove();
                  }, 1000);
                }
                let Window = window.open(
                  chrome.runtime.getURL("files/popupMercari.html"),
                  "確認",
                  `width=${items.width}, height=${items.height}, innerWidth=${items.width}, innerHeight=${items.height}`
                );
              }
            );

            console.log(items.mercariPlaceholder);

            if (items.mercariPlaceholder) {
              const textareas = document.getElementsByTagName("textarea");
              for (const textarea of textareas) {
                if (
                  textarea.getAttribute("placeholder") ==
                  "購入者へ連絡したい内容を入力してください"
                ) {
                  textarea.value = items.mercariPlaceholder;
                  textarea.dispatchEvent(new Event("input", { bubbles: true }));
                  textarea.dispatchEvent(
                    new Event("change", { bubbles: true })
                  );
                  textarea.dispatchEvent(new Event("blur", { bubbles: true }));
                  break;
                }
              }
            }
          }
          console.log("reloading");
        }, 400);
      }
    }
  );
}

if (location.hostname == "mercari-shops.com") {
  setInterval(function () {
    if (
      location.href.includes("mercari-shops.com/seller/shops/") &&
      location.href.includes("orders") &&
      !location.href.includes("/orders/") &&
      !location.href.includes("tab=completed") &&
      document.getElementsByClassName("data-copy-button").length == 0
    ) {
      getMercari();
    } else if (
      location.pathname.match(
        /^\/seller\/shops\/([a-zA-Z0-9]+)\/orders\/([a-zA-Z0-9]+)(\/)?$/
      )
    ) {
      getMercariMore();
    }
    console.log("checking...");
  }, 750);
}
