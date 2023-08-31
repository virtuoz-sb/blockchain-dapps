export const defineStep = (cur: any) => {
  if (cur === "BTC") {
    return { value: 0.00001, size: 5 }; //1 Satoshi
  }
  if (cur === "ETH") {
    return { value: 0.00001, size: 5 }; //1 Gwei
  }
  if (cur === "BNB") {
    return { value: 0.0001, size: 4 }; //1 Gwei
  }
  if (cur === "UBXT") {
    return { value: 0.0001, size: 4 }; //1 Gwei
  }
  if (cur === "USDT") {
    return { value: 0.001, size: 4 }; //1 Gwei
  }
  return { value: 0.01, size: 2 }; // USD, EUR, USDT, ...
};

export const dynamicStepDefinition = (amount: number) => {
  if (amount === 0) {
    return { value: 1, size: 1 };
  } else if (amount === 0.5) {
    return { value: 0.5, size: 1 };
  } else if (amount === 1) {
    return { value: 1, size: 1 };
  } else {
    const arr = Array.from({ length: amount }, (a, i) => (i === amount - 1 ? 1 : 0));
    const value = Number("0." + arr.join(""));

    return { value, size: amount };
  }
};
