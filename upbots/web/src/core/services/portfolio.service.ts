import { walletChartOption } from "@/models/default-models";
import { fixedDecimal } from "@/core/filters";

export const generateEvolutionData = ({ keys, selectedWallets, result }: any) => {
  const selectWalletsId = keys.filter((k: any) => selectedWallets.includes(k.name)).map((k: any) => k.id);
  const evolutionData = result.filter((ev: any) => selectWalletsId.some((k: any) => k === ev.account));

  return evolutionData
    .reduce((acc: any, cur: any) => [...acc, ...cur.data], [])
    .sort((a: any, b: any) => {
      // @ts-ignore
      return new Date(a.date) - new Date(b.date);
    });
};

export const parseTotalEvolutionData = (obj: any) => {
  const total = generateEvolutionData(obj);
  const labels = [...new Set(total.map((i: any) => i.date))];

  let seen: any = {};
  const parsedData = total
    .filter((entry: any) => {
      let previous;

      // Match the same key
      if (seen.hasOwnProperty(entry.date)) {
        previous = seen[entry.date];
        previous.data.push(entry);

        return false;
      }

      if (!Array.isArray(entry.data)) {
        entry.data = [entry];
      }

      seen[entry.date] = entry;
      return true;
    })
    .map((i: any) => {
      return i.data.reduce(
        (acc: any, cur: any) => {
          return {
            btc: (Number(acc.btc) ? acc.btc : 0) + cur.btc,
            eur: (Number(acc.eur) ? acc.eur : 0) + cur.eur,
            usd: (Number(acc.usd) ? acc.usd : 0) + cur.usd,
          };
        },
        { btc: 0, eur: 0, usd: 0 }
      );
    });

  return { labels, parsedData };
};

export const generateEvolutionChartData = ({ labels, parsedData, favoriteCurrency }: any) => {
  return {
    labels,
    datasets: [
      {
        id: 1,
        borderColor: "#32DAF5",
        backgroundColor: "rgba(50, 218, 245, 0.1)",
        pointBackgroundColor: "#32DAF5",
        pointBorderColor: "transparent",
        label: "BTC",
        value: "BTC",
        yAxisID: "BTC",
        data: parsedData.map((d: any) => fixedDecimal(d.btc, 8, 0)),
        ...walletChartOption,
      },
      {
        id: 2,
        borderColor: "#8482D2",
        backgroundColor: "rgba(132, 130, 210, 0.1)",
        pointBackgroundColor: "#8482D2",
        pointBorderColor: "transparent",
        label: favoriteCurrency.label,
        value: favoriteCurrency.label,
        yAxisID: "money",
        data: parsedData.map((d: any) => (favoriteCurrency.value === "usd" ? fixedDecimal(d.usd, 2, 0) : fixedDecimal(d.eur, 2, 0))),
        ...walletChartOption,
      },
    ],
  };
};

/* Portfolio filtering */
export const portfolioFilterUrl = (selectedWallets: any) => {
  let config = {
    params: {},
  };
  let url = "/api/portfolio/filter";
  if (selectedWallets.length > 0) {
    if (selectedWallets.includes("all")) {
      url += "/all";
    } else {
      config.params = {
        q: selectedWallets.join(","),
      };
    }
  }

  return { url, config };
};
