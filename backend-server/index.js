import http from "http";
import { server as WebSocketServer } from "websocket";

const server = http.createServer((req, res) => {
  if (req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("GETリクエストに対するレスポンスです");
  } else if (req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // データを文字列に変換
    });
    req.on("end", () => {
      console.log("POST data:", body);
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("POSTリクエストに対するレスポンスです");
    });
  }
});

const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
});

wsServer.on("request", (request) => {
  const connection = request.accept(null, request.origin);
  console.log("WebSocket接続が確立されました");

  connection.on("message", (message) => {
    if (message.type === "utf8") {
      console.log("受信したメッセージ: " + message.utf8Data);
      connection.sendUTF(
        'メッセージを受け取りました: "' + message.utf8Data + '"'
      );
    }
  });

  connection.on("close", (reasonCode, description) => {
    console.log(
      "WebSocket接続が切断されました: " + reasonCode + " - " + description
    );
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
});
