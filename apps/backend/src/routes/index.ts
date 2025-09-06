import { NextFunction, Request, Response, Router } from "express";
import authRoutes, { secret } from "./authRoutes";
import tradeRoutes from "./tradeRoutes";
import balancesRoutes from "./balancesRoutes";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "../db";
import axios from "axios";
import { RedisManager } from "../classes/RedisManager";

const router = Router();

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const userToken = req.cookies["userToken"];
    if (!userToken) {
      return res.status(401).json({
        message: "User info not found, please login",
      });
    }

    const decordData: string | JwtPayload = jwt.verify(
      userToken as string,
      secret
    );

    //@ts-ignore
    req.email = decordData.email;
    //@ts-ignore
    const timeVerify = new Date(decordData.expiration) > new Date();

    if (!decordData || !timeVerify) {
      return res.json({
        message: "Invalid Cookie, relogin and try again",
      });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorised User" });
    console.log(error);
  }
}

router.use("/", authRoutes);
router.use("/trade", authMiddleware, tradeRoutes);
router.use("/balances", authMiddleware, balancesRoutes);

//implement when the db in initialised
router.get("/supportedAssets", async (req, res) => {
  try {
    // const assets = await prisma.asset.findMany({});
    // const format = assets.map((item) => {
    //   return {
    //     image: item.imageUrl,
    //     name: item.name,
    //     symbol: item.symbol,
    //   };
    // });

    const data = await RedisManager.getSupportedAssets();

    console.log(data);
    const timeout = setTimeout(() => {
      res.json({
        message: "Request failed , backend down",
      });
    }, 5000);

    if (data) {
      clearTimeout(timeout);
      res.json({
        message: "Assets successfully fetched",
        assets: data,
      });
    }
  } catch (error) {
    res.status(404).json({
      message: "Failed to get the assets",
    });
  }
});

router.get("/candles", async (req, res) => {
  try {
    const { symbol } = req.query;

    const url = `https://api.backpack.exchange/api/v1/klines?symbol=${symbol}&interval=1h&startTime=1755833400`;

    const resonse = await axios.get(url);

    return res.json({
      message: "Candles data successfully fetched",
      data: resonse.data,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Failed to get data",
    });
  }
});

export default router;
