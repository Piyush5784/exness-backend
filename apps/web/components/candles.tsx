"use client";
import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  AreaSeries,
  LineSeries,
  type TimeChartOptions,
  type DeepPartial,
  LineStyle,
  CrosshairMode,
} from "lightweight-charts";
import axios from "axios";

function getTime(duration: string) {
  switch (duration) {
    case "1m":
      return 60 * 1000;
    case "5m":
      return 5 * 60 * 1000;
    case "15m":
      return 15 * 60 * 1000;
    case "30m":
      return 30 * 60 * 1000;
    case "1h":
      return 60 * 60 * 1000;
    case "4h":
      return 4 * 60 * 60 * 1000;
    case "1d":
      return 24 * 60 * 60 * 1000;
    default:
      return 60 * 1000;
  }
}

const Candles = ({
  symbol,
  duration,
}: {
  symbol: string;
  duration: string;
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  type CandleData = {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
  };

  const [data, setData] = useState<CandleData[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/v1/candles?symbol=${symbol}`
        );
        const processedData = res.data.data
          .map((d: any) => ({
            timestamp: new Date(d.start).getTime(),
            time: new Date(d.start).toISOString().slice(0, 19), // Keep full timestamp (YYYY-MM-DDTHH:mm:ss)
            open: parseFloat(d.open),
            high: parseFloat(d.high),
            low: parseFloat(d.low),
            close: parseFloat(d.close),
          }))
          .sort((a: any, b: any) => a.timestamp - b.timestamp) // Sort first
          .filter((d: any, index: number, arr: any[]) => {
            return index === 0 || d.timestamp !== arr[index - 1].timestamp;
          })
          .map((d: any) => ({
            // Remove the helper timestamp field
            time: d.time,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
          }));

        setData(processedData);
        console.log("Processed data:", processedData);
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    }
    let time = getTime(duration);

    fetchData();
    setInterval(() => {
      fetchData();
    }, time);
  }, [symbol, duration]);

  useEffect(() => {
    if (!chartContainerRef.current || data?.length <= 0) return;

    const chartOptions: DeepPartial<TimeChartOptions> = {
      layout: {
        background: { type: ColorType.Solid, color: "#0F0F0F" },
        textColor: "#FFFFFF",
      },
      grid: {
        vertLines: {
          color: "rgba(255, 255, 255, 0.1)",
          style: LineStyle.Dotted,
        },
        horzLines: {
          color: "rgba(255, 255, 255, 0.1)",
          style: LineStyle.Dotted,
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal, // can be Magnet, Normal
        vertLine: {
          color: "#758696",
          width: 1,
          style: LineStyle.Solid,
          labelBackgroundColor: "#758696",
        },
        horzLine: {
          color: "#758696",
          width: 1,
          style: LineStyle.Solid,
          labelBackgroundColor: "#758696",
        },
      },
      rightPriceScale: {
        borderColor: "#555",
        scaleMargins: {
          top: 0.1, // space from top
          bottom: 0.2, // space from bottom
        },
      },
      timeScale: {
        borderColor: "#555",
        timeVisible: true,
        secondsVisible: true,
        fixLeftEdge: true,
        fixRightEdge: false,
        lockVisibleTimeRangeOnResize: true,
      },
      localization: {
        locale: "en-US", // you can change this
        dateFormat: "dd MMM 'yy",
      },
      autoSize: true,
      height: 400,
      width: 900,
    };

    const chart = createChart(chartContainerRef.current, chartOptions);

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderUpColor: "#26a69a",
      borderDownColor: "#ef5350",
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    chart.addSeries(LineSeries, {
      baseLineColor: "#26a69a",
    });

    try {
      const chartData = data.map((d) => ({
        ...d,
        time: Math.floor(new Date(d.time).getTime() / 1000), // Convert to Unix timestamp in seconds
      }));

      const uniqueChartData = chartData.reduce((acc: any[], current: any) => {
        if (!acc.find((item) => item.time === current.time)) {
          acc.push(current);
        }
        return acc;
      }, []);

      uniqueChartData.sort((a, b) => a.time - b.time);

      // console.log("Final chart data:", uniqueChartData.slice(0, 5)); // Log first 5 items for debugging

      if (uniqueChartData.length > 0) {
        candlestickSeries.setData(uniqueChartData);
        chart.timeScale().fitContent();
      }
    } catch (error) {
      console.error("Error setting chart data:", error);
    }

    // Handle window resize
    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef.current?.clientWidth || 1000,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data]);

  return (
    <div className="">
      <div>
        <div ref={chartContainerRef} style={{ border: "2px solid white" }} />
      </div>

      {data.length === 0 && (
        <div className="text-gray-400">Loading chart data...</div>
      )}
    </div>
  );
};

export default Candles;
