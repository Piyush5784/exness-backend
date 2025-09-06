import { Router } from "express";
import { RedisManager } from "../classes/RedisManager";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const balance = await RedisManager.getBalance();
    return res.json({
      message: "balances successfully fetched",
      balance,
    });
  } catch (error) {
    return res.json({
      message: "Failed to fetch the balances",
    });
  }
});

router.get("/usd", async (req, res) => {
  try {
    //@ts-ignore
    const email = req.email;

    if (!email) {
      return res.json({
        message: "login and try again",
      });
    }

    const balance = await RedisManager.getBalanceUsd(email);

    return res.json({
      message: "balances successfully fetched",
      balance,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Failed to fetch the balances",
    });
  }
});

export default router;
