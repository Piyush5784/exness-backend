export function calculatePl(data: {
  openPrice: string;
  margin: number;
  decimalOpenPrice: string;
  currentPrice: string;
  decimalCurrentPrice: string;
  order: "Buy" | "Sell";
}): { pl: "PROFIT" | "LOSS"; price: number } {
  const currentPriceWithDecimal = getPriceWithDecimal({
    price: data.currentPrice,
    decimal: data.decimalCurrentPrice,
  });
  const openPriceWithDecimal = getPriceWithDecimal({
    price: data.openPrice,
    decimal: data.openPrice,
  });

  if (data.order == "Buy") {
    if (openPriceWithDecimal < currentPriceWithDecimal) {
      return {
        pl: "PROFIT",
        price: currentPriceWithDecimal - openPriceWithDecimal * data.margin,
      };
    } else {
      return {
        pl: "LOSS",
        price: openPriceWithDecimal - currentPriceWithDecimal * data.margin,
      };
    }
  } else {
    if (openPriceWithDecimal < currentPriceWithDecimal) {
      return {
        pl: "LOSS",
        price: currentPriceWithDecimal - openPriceWithDecimal * data.margin,
      };
    } else {
      return {
        pl: "PROFIT",
        price: openPriceWithDecimal - currentPriceWithDecimal * data.margin,
      };
    }
  }
}

export function getPriceWithDecimal({
  price,
  decimal,
}: {
  price: string;
  decimal: string;
}) {
  return parseInt(price) / 10 ** parseInt(decimal);
}
