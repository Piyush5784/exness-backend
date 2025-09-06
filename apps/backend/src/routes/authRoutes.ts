import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { RedisManager } from "../classes/RedisManager";
const router = Router();

export const secret = process.env.JWT_SECRET || "myjwtsecrectforemail";

router.post("/signin", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.json({
        message: "email is required",
      });
      return;
    }

    const queueResponse = await RedisManager.createUser(email);
    if (!queueResponse.emailSent) {
      return res.status(404).json({
        message: "Failed to send an email",
      });
    }
    return res.json({
      message: "Email is successfully send ",
      email,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/signin/post", async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.json({
        message: "Token is required",
      });
    }

    const data = jwt.verify(token as string, secret);

    //@ts-ignore
    const timeVerify = new Date(data.expiration) > new Date();

    if (!data || !timeVerify) {
      return res.json({
        message: "Invalid Link",
      });
    }

    const date = new Date();
    date.setHours(date.getHours() + 24);
    res.cookie("userToken", token, {
      expires: date,
    });
    return res.redirect("http://localhost:3000/dashboard");
  } catch (error) {
    console.log(error);
  }
});

router.get("/checkUser", (req, res) => {
  try {
    const token = req.cookies["userToken"];

    if (!token) {
      return res.json({
        message: "Cookie not found, invalid user",
      });
    }
    console.log(token);
    const data = jwt.verify(token, secret);

    //@ts-ignore
    const timeVerify = new Date(data.expiration) > new Date();

    if (!data || !timeVerify) {
      return res.json({
        message: "Invalid token",
      });
    }

    return res.json({
      message: "Cookie successfully verified",
    });
  } catch (error) {
    console.log(error);
  }
});

export default router;
