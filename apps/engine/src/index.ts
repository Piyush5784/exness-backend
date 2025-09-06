import { createClient } from "redis";
import { calculatePl, getPriceWithDecimal } from "./helpers/calculatePrice";
import { prisma } from "./db";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const redisGetDataClient = createClient({ url: "redis://localhost:6379" });

const redisSendDataClient = redisGetDataClient.duplicate();

const PRICE_UPDATES_KEY = process.env.REDIS_PRICE_UPDATES || "price_updates";
const secret = process.env.JWT_SECRET || "myjwtsecrectforemail";
const REDIS_KEY_FOR_BOTH_BACKEND_AND_WS =
  process.env.REDIS_KEY || "rediskeyforbothbackendandwss";

const REDIS_KEY_FOR_FRONTEND =
  process.env.REDIS_KEY_FOR_FRONTEND || "myRedisKeyForGettingDatasInFrontend";

const PRICES = {
  BTC: {
    price: "1000000000",
    decimal: "0",
  },
  ETH: {
    price: "1000000000",
    decimal: "0",
  },
  SOL: {
    price: "1000000000",
    decimal: "0",
  },
};

const transpoter = nodemailer.createTransport({
  auth: {
    user: "zackrider578414@gmail.com",
    pass: "nhic zefs abdh dmys",
  },
  service: "gmail",
});

type openOrderObj = {
  asset: "BTC" | "ETH" | "SOL";
  type: "Buy" | "Sell";
  margin: number;
  leverage: number;
  slippage: number;
  orderId: number;
  decimal: string;
  currentPrice: string;
  currentStatus: string;
};

function getRandomId() {
  return Math.floor(Math.random() * 100000000);
}

let openOrders: openOrderObj[] = [];

// type Record<K extends keyof any, T> = { [P in K]: T };

// const x: Record<"a", string>;
// let openOrders: Record<string, openOrderObj> = {};

async function redisGetDataClientCheck() {
  if (!redisGetDataClient.isOpen) {
    await redisGetDataClient.connect();
  }
}
async function redisSendDataClientCheck() {
  if (!redisSendDataClient.isOpen) {
    await redisSendDataClient.connect();
  }
}

async function getBackpackWsData() {
  try {
    await redisGetDataClientCheck();
    while (true) {
      const data = await redisGetDataClient.brPop(
        REDIS_KEY_FOR_BOTH_BACKEND_AND_WS,
        3000000
      );

      if (data) {
        const parsedData = await JSON.parse(data.element);
        if (parsedData.key == PRICE_UPDATES_KEY) {
          parsedData.priceData.map(
            (item: {
              assets: "BTC" | "ETH" | "SOL";
              decimal: string;
              price: string;
            }) => {
              if (PRICES[item.assets]) {
                ((PRICES[item.assets].price = item.price),
                  (PRICES[item.assets].decimal = item.decimal));
              }
            }
          );
        }
        if (parsedData.key == "create") {
          const orderId = getRandomId();
          //@ts-ignore
          const priceData = PRICES[parsedData.data.asset];

          const formated = {
            // asset: parsedData.data.asset,
            // type: parsedData.data.type,
            // margin: parsedData.data.margin,
            // leverage: parsedData.data.leverage,
            // slippage: parsedData.data.slippage,
            ...parsedData.data,
            // email: parsedData.data.email,
            currentPrice: priceData.price,
            decimal: priceData.decimal,
            orderId,
            currentStatus: "open",
          };
          openOrders.push(formated);
          await redisSendDataClientCheck();
          await redisSendDataClient.lPush(
            REDIS_KEY_FOR_FRONTEND,
            JSON.stringify({ email: parsedData.data.email, orderId })
          );
        }

        if (parsedData.key == "close") {
          //{
          // key: 'close',
          // data: { orderId: 47459678, email: 'piyushjha5668@gmail.com' }
          //}

          const filteredData = openOrders.find(
            (order) => order.orderId == parsedData.data.orderId
          );

          openOrders = openOrders.filter(
            (order) => order.orderId !== parsedData.data.orderId
          );

          if (filteredData) {
            const priceData = PRICES[filteredData.asset];

            const profitOrLoss = calculatePl({
              order: filteredData.type,
              margin: filteredData.margin,
              openPrice: filteredData.currentPrice,
              decimalOpenPrice: filteredData.decimal,
              currentPrice: priceData.price,
              decimalCurrentPrice: priceData.decimal,
            });

            const formated = {
              openPrice: filteredData.currentPrice,
              openPriceDecimal: filteredData.decimal,
              closePrice: priceData.price,
              leverage: filteredData.leverage,
              closePriceDecimal: priceData.decimal,
              email: parsedData.data.email,
              pl: profitOrLoss.pl,
              asset: filteredData.asset,
              pnlPrice: profitOrLoss.price,
              orderId: filteredData.orderId,
            };

            await prisma.existingTrade.create({
              data: {
                openPrice: formated.openPrice,
                user: {
                  connect: { email: formated.email },
                },
                openPriceDecimal: formated.openPriceDecimal,
                closePrice: formated.closePrice,
                closePriceDecimal: formated.closePriceDecimal,
                pnl: formated.pl,
                pnlPrice: String(formated.pnlPrice),
                liquidated: false,
                asset: {
                  connect: { symbol: formated.asset },
                },
                leverage: parseFloat(formated.leverage.toString()),
              },
            });
            await prisma.user.update({
              where: {
                email: formated.email,
              },
              data: {
                balance:
                  formated.pl == "PROFIT"
                    ? { increment: formated.pnlPrice }
                    : { decrement: formated.pnlPrice },
              },
            });

            await redisSendDataClientCheck();
            await redisSendDataClient.lPush(
              REDIS_KEY_FOR_FRONTEND,
              JSON.stringify(formated)
            );
          }
        }

        if (parsedData.key == "balances") {
          await redisSendDataClientCheck();
          await redisSendDataClient.lPush(
            REDIS_KEY_FOR_FRONTEND,
            JSON.stringify(PRICES)
          );
        }
        if (parsedData.key == "balances-usd") {
          await redisSendDataClientCheck();
          let balance;

          const user = await prisma.user.findUnique({
            where: {
              email: parsedData.data.email,
            },
          });

          await redisSendDataClient.lPush(
            REDIS_KEY_FOR_FRONTEND,
            JSON.stringify({
              balance: user?.balance,
              decimal: user?.balanceDecimal,
            })
          );
        }

        if (parsedData.key == "create-user") {
          const email = parsedData.data.email;

          console.log("data received ", parsedData);

          await prisma.user.upsert({
            where: {
              email,
            },
            update: {},
            create: {
              email,
            },
          });

          const token = generateToken(email);
          await redisSendDataClientCheck();
          const mailOption = {
            subject: "magic link",
            to: email,
            from: "myApp",
            html: `
                <a href="http://localhost:4000/api/v1/signin/post?token=${token}">Click to verify</a>

                or copy paste this link to your browser

                link:- http://localhost:4000/api/v1/signin/post?token=${token}
                `,
          };

          transpoter.sendMail(mailOption, async (err) => {
            if (err) {
              console.log(err);
              return await redisSendDataClient.lPush(
                REDIS_KEY_FOR_FRONTEND,
                JSON.stringify({ emailSent: false })
              );
            }
          });

          await redisSendDataClient.lPush(
            REDIS_KEY_FOR_FRONTEND,
            JSON.stringify({ emailSent: true })
          );
        }

        if (parsedData.key == "get-supported-assets") {
          const assets = await prisma.asset.findMany({});
          const format = assets.map((item) => {
            return {
              image: item.imageUrl,
              name: item.name,
              symbol: item.symbol,
            };
          });
          await redisSendDataClientCheck();
          await redisSendDataClient.lPush(
            REDIS_KEY_FOR_FRONTEND,
            JSON.stringify({ formatAssets: format })
          );
        }
      }

      // redisSendDataClient.bgSave();
    }
  } catch (error) {
    console.log(error);
  }
}

function generateToken(email: string) {
  try {
    const date = new Date();
    date.setHours(date.getHours() + 48);
    const token = jwt.sign({ email, expiration: date }, secret);
    return token;
  } catch (error) {
    console.log(error);
  }
}

getBackpackWsData();

// async function getAndSendQueueData() {
//   try {
//     await redisGetDataClientCheck();
//     await redisSendDataClientCheck();
//     let jsonData = {};
//     while (true) {
//       const data = await redisGetDataClient.brPop(publishKey, 3000000);
//       jsonData = JSON.parse(data?.element ?? "");

//       await redisSendDataClient.lPush(PopKey, JSON.stringify({ jsonData }));
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }

// getAndSendQueueData();
// subscribeData();

// async function subscribeData() {
//   try {
//     await redisPopQueueClientCheck();
//     // await redisSendDataClient.subscribe(PopKey, async (data) => {
//     //   const parsedData = await JSON.parse(data);

//     //   parsedData.map(
//     //     (item: {
//     //       assets: "BTC" | "ETH" | "SOL";
//     //       decimal: string;
//     //       price: string;
//     //     }) => {
//     //       if (PRICES[item.assets]) {
//     //         ((PRICES[item.assets].price = item.price),
//     //           (PRICES[item.assets].decimal = item.decimal));
//     //       }
//     //     }
//     //   );
//     // });

//     await redisSendDataClient.lPush(PopKey, JSON.stringify({

//     }));
//   } catch (error) {
//     console.log(error);
//   }
// }
