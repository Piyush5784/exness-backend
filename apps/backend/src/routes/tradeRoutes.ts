import { Request, Router, Response } from "express";
import { RedisManager } from "../classes/RedisManager";
import { prisma } from "../db";
import * as z from "zod";
const router = Router();

// {
// 	asset: "BTC",
// 	type: "long" | "short",
// 	margin: 50000, // decimal is 2, so this means 500$
// 	leverage: 10, // so the user is trying to buy $5000 of exposure
// 	slippage: 100, // in bips, so this means 1%
// }

export type RequestData = {
  asset: "BTC" | "ETH" | "SOL";
  type: "Buy" | "Sell";
  margin: number;
  leverage: string;
  slippage: string;
};

const createOrderSchema = z.object({
  asset: z.union([z.literal("ETH"), z.literal("SOL"), z.literal("BTC")]),
  type: z.union([z.literal("Buy"), z.literal("Sell")]),
  margin: z.number().min(0.1),
  leverage: z.string(),
  slippage: z.string(),
});

router.post("/create", async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const email = req.email;

    const body = req.body;

    const checkFormat = createOrderSchema.safeParse(body);

    if (!checkFormat.success) {
      console.log(checkFormat.error);
      return res.json({
        message: "Invalid data for creating order",
        error: checkFormat.error,
      });
    }
    const orderId = await RedisManager.createOrder({
      asset: checkFormat.data?.asset,
      type: checkFormat.data.type,
      margin: checkFormat.data.margin,
      leverage: checkFormat.data.leverage,
      slippage: checkFormat.data.slippage,
      email: email,
    });

    const timeout = setTimeout(() => {
      res.json({
        message: "Request failed , backend down",
      });
    }, 5000);

    if (orderId) {
      clearTimeout(timeout);
      res.json({
        message: "Order placed",
        orderId,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Something went wrong, don't worry we have backups",
    });
  }
});

router.post("/close", async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const email = req.email;

    const { orderId }: { orderId: string } = req.body;

    const data = await RedisManager.closeOrder({
      orderId,
      email: email,
    });

    console.log("data comming is ", data);

    const timeout = setTimeout(() => {
      res.json({
        message: "Request failed , backend down",
      });
    }, 5000);

    if (data) {
      clearTimeout(timeout);
      res.json({
        message: "Order Successfully closed",
        data,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Something went wrong, don't worry we have backups",
    });
  }
});

export default router;
