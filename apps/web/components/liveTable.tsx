"use client";
import React, { useEffect, useState } from "react";

type data = { assets: "BTC" | "ETH" | "SOL"; price: string; decimal: string };

function calculatePrice(price: string, decimal: string) {
  const cp = parseInt(price) / 10 ** parseInt(decimal);
  return cp ? cp : "";
}

export let RecordPrice = {
  BTC: { price: "00", decimal: "00" },
  ETH: { price: "00", decimal: "00" },
  SOL: { price: "00", decimal: "00" },
};

const LiveTable = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [prices, SetPrices] = useState<data[]>([]);

  let lastUpdate = 0;

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    setWs(socket);

    socket.onopen = (msg) => {
      console.log("Connection established");
    };

    socket.onmessage = (msg: any) => {
      if (msg && msg?.data) {
        const parsedData = JSON.parse(msg.data);
        const now = Date.now();

        if (now - lastUpdate > 1000) {
          SetPrices(parsedData);
          lastUpdate = now;
        }
      }
    };

    socket.onerror = (err) => {
      console.log(err);
    };

    return () => socket.close();
  }, []);

  useEffect(() => {
    prices.map((item) => {
      RecordPrice[item.assets] = { price: item.price, decimal: item.decimal };
    });
  }, [prices]);

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Asset
            </th>
            <th scope="col" className="px-6 py-3">
              Price
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
            <th
              scope="row"
              className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              SOL
            </th>
            <td className="px-6 py-4">
              {calculatePrice(
                RecordPrice.SOL.price.toString(),
                RecordPrice.SOL.decimal.toString()
              )}
            </td>
          </tr>
          <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
            <th
              scope="row"
              className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              ETH
            </th>
            <td className="px-6 py-4">
              {" "}
              {calculatePrice(
                RecordPrice.ETH.price.toString(),
                RecordPrice.ETH.decimal.toString()
              )}
              {/* {RecordPrice.ETH.price.toString()} */}
            </td>
          </tr>
          <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
            <th
              scope="row"
              className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              BTC
            </th>
            <td className="px-6 py-4">
              {" "}
              {calculatePrice(
                RecordPrice.BTC.price.toString(),
                RecordPrice.BTC.decimal.toString()
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default LiveTable;
