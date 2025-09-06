import { WebSocket, WebSocketServer } from "ws";
import { format } from ".";

const wss = new WebSocketServer({ port: 8080 });

const clients: Set<WebSocket> = new Set();

console.log("Check it ");
wss.on("connection", (ws) => {
  console.log("Client connected");
  clients.add(ws);

  ws.on("error", console.error);

  ws.on("close", () => {
    clients.delete(ws);
  });
});

export async function sendData(data: format[]) {
  const message = JSON.stringify(data);

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      // setInterval(() => {
      client.send(message);
      // }, 1000);
    }
  }
}
