
//ストアクリエイタープロ 住所コピー
if (
  location.href.startsWith("https://pro.store.yahoo.co.jp/") &&
  location.href.includes("order/manage/detail")
) {
  const ordererData = [
    ...document.querySelectorAll(
      "form > div > div > .ReceAdd > table > tbody > tr"
    ),
  ].map((x) => {
    return {
      key: x.querySelector("th")?.innerText,
      val: x.querySelector("td")?.innerText,
    };
  });
  document
    .querySelector("form > div > div > .ReceAdd > table > tbody")
    .insertAdjacentHTML(
      "afterbegin",
      `
    <style>
    #ecassist-copy-btn{
        display: block;
        background-color: #ffcc00;
        color: #000;
        border-radius: 5px;
        padding: 5px;
        box-shadow: 0 0 5px #0005;
        margin: 5px;
        text-align: center;
    }
    #ecassist-copy-btn:hover{
        cursor: pointer;
        background-color: #ffdd00;
    }
    </style>
    <tr>
        <div id="ecassist-copy-btn">拡張機能にコピー</div>
    </tr>
    `
    );
  console.log(ordererData);
  document
    .getElementById("ecassist-copy-btn")
    .addEventListener("click", function () {
      const copyData = {};
      ordererData.forEach((x) => {
        switch (x.key.trim()) {
          case "氏名":
            copyData["name"] = x.val;
            break;
          case "郵便番号":
            copyData["postnum1"] = x.val.trim().slice(0, 3);
            copyData["postnum2"] = x.val.trim().slice(-4);
            break;
          case "住所":
            copyData["address"] = x.val.trim();
            copyData["prefacture"] = x.val
              .trim()
              .replace(/^(.{2}[都道府県]|.{3}県)(.+)/, "$1 $2")
              .split(" ")[0];
            copyData["municipality"] = x.val
              .trim()
              .replace(/^(.{2}[都道府県]|.{3}県)(.+)/, "$1 $2")
              .split(" ")[1];
            break;
          case "電話番号":
            copyData["tel"] = x.val.replace(/[^0-9]/g, "");
            break;
          default:
            break;
        }
      });
      copyData["choume"] = "";
      copyData["apart"] = "";
      chrome.runtime.sendMessage(
        {
          action: "getJson",
          endpoint:
            "https://zipcloud.ibsnet.co.jp/api/search?zipcode=" +
            copyData["postnum1"] +
            copyData["postnum2"],
        },
        function (response) {
          if (response.status == 200) {
            copyData["choume"] = copyData.municipality.replace(
              response.results[0].address2,
              ""
            );
            copyData["municipality"] = response.results[0].address2;
          }
          console.log(copyData);
          // copy to clicpboard
          navigator.clipboard.writeText(JSON.stringify(copyData)).then(
            () => {
              alert("コピーしました");
            },
            () => {
              alert("コピーに失敗しました");
            }
          );
        }
      );
    });
  }

