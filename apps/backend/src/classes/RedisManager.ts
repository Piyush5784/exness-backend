import { createClient, RedisClientType } from "redis";
import { RequestData } from "../routes/tradeRoutes";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const REDIS_KEY_FOR_BOTH_BACKEND_AND_WS =
  process.env.REDIS_KEY || "rediskeyforbothbackendandwss";

const REDIS_KEY_FOR_FRONTEND =
  process.env.REDIS_KEY_FOR_FRONTEND || "myRedisKeyForGettingDatasInFrontend";

export class RedisManager {
  private static redisInstance: RedisManager;
  private redisGetDataClient: RedisClientType;
  private redisSendDataClient: RedisClientType;

  private constructor() {
    this.redisGetDataClient = createClient({ url: redisUrl });
    this.redisGetDataClient.connect();

    this.redisSendDataClient = createClient({ url: redisUrl });
    this.redisSendDataClient.connect();
  }

  public static getRedisInstance() {
    if (!this.redisInstance) {
      return (this.redisInstance = new RedisManager());
    }
    return this.redisInstance;
  }
  public static getRandomId() {
    return Math.floor(Math.random() * 1000000000000);
  }

  public static async createOrder(data: RequestData & { email: string }) {
    this.getRedisInstance();
    try {
      const payload = { key: "create", data };
      await this.redisInstance.redisSendDataClient.lPush(
        REDIS_KEY_FOR_BOTH_BACKEND_AND_WS,
        JSON.stringify(payload)
      );
      console.log("Sent data", payload);
      while (true) {
        const engineData = await this.redisInstance.redisGetDataClient.brPop(
          REDIS_KEY_FOR_FRONTEND,
          5000
        );

        //         {
        //   key: 'myRedisKeyForGettingDatasInFrontend',
        //   element: '{"email":"piyushjha5668@gmail.com","orderId":8237977}'
        // }

        if (engineData) {
          //@ts-ignore
          const parsedData = JSON.parse(engineData.element);
          if (parsedData.email == data.email) {
            return parsedData.orderId;
          }
        }
      }
      // await this.redisInstance.redisStreamClient.xAdd(streamKey, "*", {
      //   id,
      //   asset: data.asset,
      //   type: data.type,
      //   margin: data.margin.toString(),
      //   leverage: data.leverage.toString(),
      //   slippage: data.slippage.toString(),
      // });
    } catch (err) {
      console.log(err);
    }
  }

  public static async closeOrder(data: { email: string; orderId: string }) {
    this.getRedisInstance();
    try {
      const payload = { key: "close", data };

      await this.redisInstance.redisSendDataClient.lPush(
        REDIS_KEY_FOR_BOTH_BACKEND_AND_WS,
        JSON.stringify(payload)
      );

      console.log("Sent data", payload);
      while (true) {
        const engineData = await this.redisInstance.redisGetDataClient.brPop(
          REDIS_KEY_FOR_FRONTEND,
          5000
        );

        if (engineData) {
          const parsedData = JSON.parse(engineData.element);

          if (parsedData.email == data.email) {
            return parsedData;
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  public static async getBalance() {
    this.getRedisInstance();
    try {
      const payload = { key: "balances", data: {} };
      await this.redisInstance.redisSendDataClient.lPush(
        REDIS_KEY_FOR_BOTH_BACKEND_AND_WS,
        JSON.stringify(payload)
      );
      while (true) {
        const engineData = await this.redisInstance.redisGetDataClient.brPop(
          REDIS_KEY_FOR_FRONTEND,
          5000
        );

        if (engineData) {
          const parsedData = JSON.parse(engineData.element);
          return parsedData;
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  public static async createUser(email: string) {
    this.getRedisInstance();
    try {
      const payload = { key: "create-user", data: { email } };
      await this.redisInstance.redisSendDataClient.lPush(
        REDIS_KEY_FOR_BOTH_BACKEND_AND_WS,
        JSON.stringify(payload)
      );
      while (true) {
        const engineData = await this.redisInstance.redisGetDataClient.brPop(
          REDIS_KEY_FOR_FRONTEND,
          5000
        );

        // console.log(engineData);
        if (engineData) {
          const parsedData = JSON.parse(engineData.element);
          return parsedData;
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  public static async getSupportedAssets() {
    this.getRedisInstance();
    try {
      const payload = { key: "get-supported-assets", data: {} };
      await this.redisInstance.redisSendDataClient.lPush(
        REDIS_KEY_FOR_BOTH_BACKEND_AND_WS,
        JSON.stringify(payload)
      );
      while (true) {
        const engineData = await this.redisInstance.redisGetDataClient.brPop(
          REDIS_KEY_FOR_FRONTEND,
          5000
        );

        // console.log(engineData);
        if (engineData) {
          const parsedData = JSON.parse(engineData.element);
          return parsedData;
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  public static async getBalanceUsd(email: string) {
    this.getRedisInstance();
    try {
      const payload = { key: "balances-usd", data: { email } };
      await this.redisInstance.redisSendDataClient.lPush(
        REDIS_KEY_FOR_BOTH_BACKEND_AND_WS,
        JSON.stringify(payload)
      );
      while (true) {
        const engineData = await this.redisInstance.redisGetDataClient.brPop(
          REDIS_KEY_FOR_FRONTEND,
          5000
        );

        if (engineData) {
          const parsedData = JSON.parse(engineData.element);
          return parsedData;
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}
