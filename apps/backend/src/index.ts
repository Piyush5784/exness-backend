import express, { type Request, type Response } from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import mainRoutes from "./routes/index";

// "dev": "next dev --turbopack --port 3001", //docs

// "dev": "next dev --turbopack --port 3000", //web

export const app = express();
const port = 4000;

app.get("/sum", (req, res) => {
  return res.json({
    message: "Sum executed",
    sum: 4,
  });
});

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"],
  })
);

app.use("/api/v1", mainRoutes);

app.listen(port, () => {
  console.log("Server started on port", port);
});
