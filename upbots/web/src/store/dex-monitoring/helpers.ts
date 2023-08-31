import { Vue } from "vue-property-decorator";
import { PortfolioEvolution } from "@/components/portfolio/types/portfolio.types";
import $http from "@/core/api.config";
import { cloneDeep } from "@/core/helper-functions";
import moment from "moment";
import { AssetsSummary, DexAssetsDto, DexWallet, ProjectsData, TokenData, UsdConversionRates } from "./types";
import { default as Web3 } from "web3";

export const resolveEns = async (address: string): Promise<string> => {
  const isEthAddress = (Web3 as any).utils.isAddress(address);
  if (isEthAddress) return address;

  const isEns = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(address);
  const web3 = new Web3(new Web3.providers.HttpProvider(`${process.env.VUE_APP_WEB3_PROVIDER_INFURA}`));
  if (isEns) return web3.eth.ens.getAddress(address);

  return null;
};

export const reduceProjectsData = (projectsData: ProjectsData[], wallet: DexWallet): ProjectsData => {
  const res: ProjectsData = {};
  let data: ProjectsData[] = [];
  if (wallet.allWallets) {
    data = cloneDeep(projectsData);
  } else if (wallet.address) {
    data = (cloneDeep(projectsData) as ProjectsData[]).filter((project) => project.address === wallet.address);
  }

  data.forEach((d) => {
    if (d.uniswapV2 && res.uniswapV2) {
      res.uniswapV2 = [...d.uniswapV2, ...res.uniswapV2];
    } else if (d.uniswapV2) {
      res.uniswapV2 = [...d.uniswapV2];
    }

    if (d.pancakeswap && res.pancakeswap) {
      res.pancakeswap = [...d.pancakeswap, ...res.pancakeswap];
    } else if (d.pancakeswap) {
      res.pancakeswap = [...d.pancakeswap];
    }

    if (d.balancer && res.balancer) {
      res.balancer = [...d.balancer, ...res.balancer];
    } else if (d.balancer) {
      res.balancer = d.balancer;
    }

    if (d.curve && res.curve) {
      res.curve = [...d.curve, ...res.curve];
    } else if (d.curve) {
      res.curve = d.curve;
    }

    if (d.aave && res.aave) {
      res.aave.supplied = [...d.aave.supplied, ...res.aave.supplied];
      res.aave.borrowed = [...d.aave.borrowed, ...res.aave.borrowed];
    } else if (d.aave) {
      res.aave = d.aave;
    }

    if (d.compound && res.compound) {
      res.compound.supplied = [...d.compound.supplied, ...res.compound.supplied];
      res.compound.borrowed = [...d.compound.borrowed, ...res.compound.borrowed];
    } else if (d.compound) {
      res.compound = d.compound;
    }

    if (d.sushiswap && res.sushiswap) {
      res.sushiswap.stake.balance += d.sushiswap.stake.balance;
      res.sushiswap.stake.usdValue += d.sushiswap.stake.usdValue;
    } else if (d.sushiswap) {
      res.sushiswap = d.sushiswap;
    }
  });

  return res;
};

export const saveWallets = (wallet: DexWallet) => {
  return $http.put("/api/dex-monitoring/wallet", [wallet]);
};

export const getTokensSum = (tokens: TokenData[], wallet: DexWallet): TokenData[] => {
  const res: TokenData[] = [];
  tokens.forEach((token) => {
    if (wallet.address && token.address !== wallet.address) return;
    const existingToken = res.find(
      ({ contractTickerSymbol, blockchain }) => token.contractTickerSymbol === contractTickerSymbol && token.blockchain === blockchain
    );
    if (existingToken) {
      existingToken.balance += token.balance;
      existingToken.quote += token.quote;
    } else {
      res.push({ ...token });
    }
  });

  return res;
};

export const calculateTotalAssets = (tokens: TokenData[], projectsDataList: ProjectsData[], wallet: DexWallet): number => {
  const walletAssets = getTokensSum(tokens, wallet).reduce((acc, { quote }) => acc + quote, 0);
  const projectsData = reduceProjectsData(projectsDataList, wallet);

  let defiAssets = 0;
  if (projectsData.uniswapV2) {
    const uniswapV2Assets = projectsData.uniswapV2.reduce((acc, { totalUsdValue }) => acc + totalUsdValue, 0);
    defiAssets += uniswapV2Assets;
  }
  if (projectsData.balancer) {
    const balancerAssets = projectsData.balancer.reduce((acc, { totalUsdValue }) => acc + totalUsdValue, 0);
    defiAssets += balancerAssets;
  }
  if (projectsData.curve) {
    const curveAssets = projectsData.curve.reduce((acc, { totalUsdValue }) => acc + totalUsdValue, 0);
    defiAssets += curveAssets;
  }
  if (projectsData.aave) {
    const aaveAssets = projectsData.aave.supplied.reduce((acc, { usdValue }) => acc + usdValue, 0);
    defiAssets += aaveAssets;
  }
  if (projectsData.compound) {
    const compoundAssets = projectsData.compound.supplied.reduce(
      (acc, supp) => acc + supp.reduce((acc2, { usdValue }) => acc2 + usdValue, 0),
      0
    );

    defiAssets += compoundAssets;
  }
  if (projectsData.sushiswap) {
    const sushiswapAssets = projectsData.sushiswap.stake.usdValue;
    defiAssets += sushiswapAssets;
  }

  return defiAssets + walletAssets;
};

export const calculateTotalDebts = (projectsDataList: ProjectsData[], wallet: DexWallet): number => {
  const projectsData = reduceProjectsData(projectsDataList, wallet);
  let totalDebts = 0;

  if (projectsData.aave) {
    const aaveAssets = projectsData.aave.borrowed.reduce((acc, { usdValue }) => acc + usdValue, 0);
    totalDebts += aaveAssets;
  }
  if (projectsData.compound) {
    const compoundAssets = projectsData.compound.borrowed.reduce(
      (acc, borr) => acc + borr.reduce((acc2, { usdValue }) => acc2 + usdValue, 0),
      0
    );

    totalDebts += compoundAssets;
  }
  return totalDebts;
};

export const updateAssetsSummary = async () => {
  const savedAssets = localStorage.getItem("ethAssets");
  const previousAssets: AssetsSummary[] = savedAssets ? JSON.parse(savedAssets) : [];

  const res = await $http.post<DexAssetsDto[]>("/api/dex-monitoring/evolution", previousAssets);

  localStorage.removeItem("ethAssets");

  return res.data.map((elem) => {
    return {
      address: elem.address,
      evolution: elem.evolution.filter((evo, i) => {
        if (i === elem.evolution.length - 1) {
          return true;
        }
        return !moment(evo.date).isSame(moment(elem.evolution[i + 1].date), "day");
      }),
    };
  });
};

export const generatePortfolioEvolution = (
  wallets: DexWallet[],
  selectedWallet: DexWallet,
  assetsEvolution: AssetsSummary[],
  selectedQuantity: string
): PortfolioEvolution => {
  const filteredAssets = selectedWallet.allWallets
    ? assetsEvolution.filter(({ address }) => wallets.find((wallet) => wallet.address === address))
    : assetsEvolution.filter(({ address }) => address === selectedWallet.address);

  const longestEvolution = filteredAssets.reduce((acc, val) => (val.evolution.length > acc.length ? val.evolution : acc), []);

  if (!longestEvolution || !longestEvolution.length) {
    return null;
  }

  const dates: Date[] = longestEvolution.map(({ date }) => date);

  const priceData = dates.map((date) => {
    const assetsForDay: any[] = [];
    filteredAssets.forEach(({ evolution }) => {
      const assetForDay = evolution.find((evolution) => moment(evolution.date).isSame(moment(date), "day"));
      if (assetForDay) {
        assetsForDay.push(assetForDay);
      }
    });

    const networth = assetsForDay.reduce((acc, val) => {
      return {
        btc: acc.btc + val.btc,
        usd: acc.usd + val.usd,
        eur: acc.eur + val.eur,
      };
    });
    return networth;
  });

  /* FILTERED DATA */
  const end = moment().format("YYYY-MM-DD");
  let start = "";

  if (selectedQuantity === "all") {
    start = "1970-01-01";
  } else if (selectedQuantity === "1,day") {
    start = moment().subtract(1, "days").format("YYYY-MM-DD");
  } else {
    const [num, type]: any = selectedQuantity.split(",");
    start = moment().subtract(Number(num), type).format("YYYY-MM-DD");
  }

  let filteredData = longestEvolution.filter((el: any) => {
    return moment(el.date).format("YYYY-MM-DD") >= start && moment(el.date).format("YYYY-MM-DD") <= end;
  });

  let filteredLabels = filteredData.map((el: any) => el.date);

  return {
    labels: filteredLabels.map((date) => moment(date).format("YYYY-MM-DD")),
    datasets: [
      {
        id: 1,
        borderColor: "#8482D2",
        backgroundColor: "rgba(132, 130, 210, 0.44)",
        pointBackgroundColor: "#6E4498",
        pointBorderColor: "#6E4498",
        label: "BTC",
        value: "BTC",
        yAxisID: "BTC",
        data: filteredData.map(({ btc }) => btc),
        lineTension: 0.4,
        borderWidth: 2,
        pointBorderWidth: 0,
        pointHoverRadius: 0,
        pointHoverBorderWidth: 0,
        pointRadius: 0,
        pointHitRadius: 0,
      },
      {
        id: 2,
        borderColor: "#32DAF5",
        backgroundColor: "rgba(50, 211, 241, 0.44)",
        pointBackgroundColor: "rgba(14, 142, 186, 0.5)",
        pointBorderColor: "rgba(14, 142, 186, 0.5)",
        label: "USD",
        value: "USD",
        yAxisID: "money",
        data: filteredData.map(({ usd }) => usd),
        lineTension: 0.4,
        borderWidth: 2,
        pointBorderWidth: 0,
        pointHoverRadius: 0,
        pointHoverBorderWidth: 0,
        pointRadius: 0,
        pointHitRadius: 0,
      },
    ],
  };
};
