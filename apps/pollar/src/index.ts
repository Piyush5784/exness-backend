import WebSocket from "ws";
import redis, { createClient } from "redis";
import { sendData } from "./wsFrontend";

const ws = new WebSocket("wss://ws.backpack.exchange/");

export type format = {
  assets: string;
  price: string | undefined;
  decimal: string | undefined;
};

const client = createClient({
  url: "redis://localhost:6379",
});

const PRICE_UPDATES_KEY = process.env.REDIS_PRICE_UPDATES || "price_updates";

const REDIS_KEY_FOR_BOTH_BACKEND_AND_WS =
  process.env.REDIS_KEY || "rediskeyforbothbackendandwss";

let currentData: format[] = [
  {
    assets: "BTC",
    price: "",
    decimal: "",
  },
  {
    assets: "SOL",
    price: "",
    decimal: "",
  },
  {
    assets: "ETH",
    price: "",
    decimal: "",
  },
];

async function startWs() {
  await client.connect();
  if (ws) {
    console.log("Websocket ready ");
    ws.on("error", console.error);

    ws.on("open", function open() {
      console.log("Connected to backpack api ");
      ws.send(
        JSON.stringify({
          method: "SUBSCRIBE",
          params: [
            "bookTicker.SOL_USDC",
            "bookTicker.ETH_USDC",
            "bookTicker.BTC_USDC",
          ],
        })
      );
    });

    // const d = {
    //   data: {
    //     A: "0.00002",
    //     B: "0.01049",
    //     E: 1756817049149293,
    //     T: 1756817049140483,
    //     a: "108846.6",
    //     b: "108843.6",
    //     e: "bookTicker",
    //     s: "BTC_USDC",
    //     u: 1656659042,
    //   },
    //   stream: "bookTicker.BTC_USDC",
    // };

    ws.on("message", async function message(data) {
      const stringFormat = data.toString();

      const parsedData = await JSON.parse(stringFormat).data;

      const price = convertPrice(parsedData.a);

      const formattedData = {
        assets: parsedData.s.split("_")[0],
        price: price.priceWithoutDecimal,
        decimal: price.decimal,
      };

      currentData = currentData.map((item) =>
        item.assets === formattedData.assets
          ? {
              ...item,
              price: formattedData.price ?? "",
              decimal: formattedData.decimal ?? "",
            }
          : item
      );
      const payload = { priceData: currentData, key: PRICE_UPDATES_KEY };
      sendData(currentData);

      client.lPush(REDIS_KEY_FOR_BOTH_BACKEND_AND_WS, JSON.stringify(payload));
    });
  }
}

function convertPrice(price: string) {
  if (price.includes(".")) {
    const [intPart, decimalPart] = price.split(".");
    const decimal = decimalPart?.length.toString();
    const priceWithoutDecimal = intPart?.concat(decimalPart ?? "");
    return { priceWithoutDecimal, decimal };
  } else {
    return { priceWithoutDecimal: price, decimal: "0" };
  }
}

startWs();
