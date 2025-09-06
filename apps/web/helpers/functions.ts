import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

export const BACKEND_URL = "http://localhost:4000/api/v1";

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 5000,
  withCredentials: true,
});

export type RequestData = {
  asset: "BTC" | "ETH" | "SOL";
  type: "Buy" | "Sell";
  margin: number;
  leverage: string;
  slippage: string;
};

export const createOrder = async (data: RequestData) => {
  const res = await api.post("/trade/create", data);
  return res.data;
};

export function useSendData() {
  return useMutation({
    mutationFn: async (data: RequestData) => {
      return await createOrder(data);
    },
    onSuccess: (data) => {
      toast.success("Order successfully placed");
      return data;
    },
    onError: () => {
      toast.error("Failed to place an order");
      return null;
    },
  });
}
