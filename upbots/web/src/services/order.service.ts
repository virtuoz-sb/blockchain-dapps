export const orderParser = (orders: any, exhangesPairs: any, keys: any) => {
  return orders.map((o: any) => {
    const exKeyName = keys.find((k: any) => {
      return k.id === o.exchKeyId;
    });

    const exSymbol = exhangesPairs[o.exch].find((ex: any) => {
      let pairSymbol = ex.symbol;
      if (ex.exchange === "ftx") {
        pairSymbol = pairSymbol.replace("/", "");
      }
      return ex.symbol === o.sbl || pairSymbol === o.sbl;
    });

    if (!exSymbol || !exSymbol.baseCurrency) {
      return {};
    }
    return {
      ...o,
      accountName: (exKeyName && exKeyName.name) || "N/A",
      baseCurrency: exSymbol.baseCurrency,
      quoteCurrency: exSymbol.quoteCurrency,
    };
  });
};
