"use client";
import React, { useEffect, useState } from "react";
import * as z from "zod";
import TradingViewWidget from "../../components/candles";
import LiveTable, { RecordPrice } from "../../components/liveTable";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_URL, RequestData, useSendData } from "../../helpers/functions";

export const getClientSideCookie = (name: string) => {
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=");
  return cookieValue ? cookieValue[1] : undefined;
};

function getSymbol(sym: string) {
  return sym.split("_")[0];
}

const createOrderSchema = z.object({
  asset: z.union([z.literal("ETH"), z.literal("SOL"), z.literal("BTC")]),
  type: z.union([z.literal("Buy"), z.literal("Sell")]),
  margin: z.number().min(0.1),
  leverage: z.string(),
  slippage: z.string(),
});

const Dashboard = () => {
  const [symbol, setSymbol] = useState("SOL_USDC");
  const [balance, setBalance] = useState("0");
  const [input, setInput] = useState("");
  const [user, setUser] = useState<any>();
  const [orders, setOrder] = useState<{ buyPrice: string; orderId: number }[]>(
    []
  );

  const [buy, setBuy] = useState(true);

  const { mutate, mutateAsync, isSuccess, isError } = useSendData();

  const query = useQuery({
    queryKey: ["balances"],
    queryFn: async () => {
      const res = await axios.get(`${BACKEND_URL}/balances/usd`, {
        withCredentials: true,
      });
      setBalance(parseFloat(res.data.balance).toString());
      setUser(res.data.user);
      return res.data;
    },
  });

  async function handleBuyOrSell() {
    try {
      const format: RequestData = {
        //@ts-ignore
        asset: getSymbol(symbol),
        margin: parseInt(input),
        leverage: "0",
        slippage: "0",
        type: buy ? "Buy" : "Sell",
      };
      const data = await mutateAsync(format);
      setOrder([
        ...orders,
        { buyPrice: RecordPrice[format.asset], orderId: data.orderId },
      ]);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="text-center border p-4 flex gap-10 flex-col ">
      <div className="w-full">
        <div className="flex justify-between items-center">
          <div className="w-[200px]">
            <label
              htmlFor="countries"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Select an currency
            </label>
            <select
              id="countries"
              onChange={(e) => setSymbol(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="SOL_USDC">SOL</option>
              <option value="ETH_USDC">ETH</option>
              <option value="BTC_USDC">BTC</option>
            </select>
          </div>
          <div>
            <div className="border p-2 rounded-xl bg-gray-900 shadow-2xl">
              {user && user.email} | Balance {balance.toString()}.00
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-between border">
        <div className="border w-full flex flex-col gap-10">
          <LiveTable />
        </div>
        <TradingViewWidget symbol={symbol} duration="1m" />
        <div className=" w-full flex flex-col p-2 gap-2">
          <button
            type="button"
            onClick={() => setBuy(true)}
            className={`focus:outline-none text-white ${buy && "bg-green-700"} hover:bg-green-800  font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2  `}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setBuy(false)}
            className={`focus:outline-none text-white ${!buy && "bg-red-700"} hover:bg-red-800  font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 `}
          >
            Sell
          </button>
          <div className=" w-full">
            <label
              htmlFor="first_name"
              className="block mb-2 text-start text-sm font-medium text-gray-900 dark:text-white"
            >
              {buy ? "Buy" : "Sell"}
            </label>
            <input
              type="number"
              min={0.1}
              onChange={(e) => setInput(e.target.value)}
              id="first_name"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 "
              placeholder="Confrim lots"
              required
            />
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleBuyOrSell();
            }}
            className="text-white  bg-blue-700 hover:bg-blue-800  focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
          >
            Confirm {buy ? "Buy" : "Sell"} {}
          </button>
        </div>
      </div>{" "}
      <div className="border flex items-center justify-between pr-2">
        <div className="border py-4 px-2">Order Id 834523423</div>
        <div className="border  py-4 px-2">Buy Price 89340.00</div>
        <div className="border  py-4 px-2">Current Price 890.00</div>
        <div className="border  py-4 px-2">p/l 8.00</div>
        <div className=" ">
          {" "}
          <button
            type="button"
            className={`focus:outline-none text-white bg-red-700 hover:bg-red-800  font-medium rounded-lg text-sm px-5 py-2.5  `}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
