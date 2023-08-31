import { EventEmitter } from "events";
import { Logger, mongoDB, IStoredCoin } from "@torobot/shared";
import axios from "axios";
export class Currency extends EventEmitter {
  currentId: number = 0;
  coingeckoAPIBaseUrlForPrice: string = 'https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=';
  coingeckoSymbolIds = [
    {
      chain: 'Polygon',
      symbols: ['MATIC', 'WMATIC'],
      ids: 'matic-network',
      price: 0,
    },
    {
      chain: 'Binance',
      symbols: ['BNB', 'WBNB'],
      ids: 'binancecoin',
      price: 0,
    },
    {
      chain: 'Binance',
      symbols: ['BUSD'],
      ids: 'binance-usd',
      price: 0,
    },
    {
      chain: 'Fantom',
      symbols: ['FTM', 'WFTM'],
      ids: 'fantom',
      price: 0,
    },
    {
      symbols: ['USDC', 'USDC.e'],
      ids: 'usd-coin',
      price: 0,
    },
    {
      chain: 'Avalanche',
      symbols: ['AVAX', 'WAVAX'],
      ids: 'avalanche-2',
      price: 0,
    },
    {
      chain: 'Polygon',
      symbols: ['USDT'],
      ids: 'tether',
      price: 0,
    },
    {
      chain: 'Harmony',
      symbols: ['ONE', 'WONE'],
      ids: 'harmony',
      price: 0,
    },
    {
      chain: 'Ethereum',
      symbols: ['ETH'],
      ids: 'ethereum',
      price: 0,
    },
    {
      chain: 'Celo',
      symbols: ['CELO', 'WCELO'],
      ids: 'celo',
      price: 0,
    },
    {
      chain: 'Celo',
      symbols: ['CUSD'],
      ids: 'celo-dollar',
      price: 0,
    },
    {
      chain: 'Harmony',
      symbols: ['1FRAX'],
      ids: 'frax',
      price: 0,
    },
    {
      chain: 'xDai',
      symbols: ['XDAI', 'WXDAI'],
      ids: 'xdai',
      price: 0,
    },
    {
      symbols: ['WETH'],
      ids: 'weth',
      price: 0,
    },
  ]
  logger: Logger;
  private intervalID = null;

  get logPrefix() {
    return `scannerThread-`;
  }

  constructor() {
    super();
  }

  start() {
    this.intervalID = setInterval(() => this.process(), 20000);
  }

  async process() {
    console.log(this.currentId);
    try {
      const ids = this.coingeckoSymbolIds[this.currentId].ids
      const price = await axios.get(this.coingeckoAPIBaseUrlForPrice + ids);
      this.coingeckoSymbolIds[this.currentId].price = price.data[ids].usd;
      console.log("Caculation Price: ", ids, price.data[ids].usd);
      const chain = await mongoDB.Blockchains.findOne({ name: this.coingeckoSymbolIds[this.currentId].chain });
      await mongoDB.Coins.updateMany(
        {
          symbol: { '$in': this.coingeckoSymbolIds[this.currentId].symbols },
          ...(this.coingeckoSymbolIds[this.currentId].chain && chain) ? {blockchain: chain._id} : {}
        }, {
          '$set': { "price": price.data[ids].usd }
        }
      );
    } catch (e) {
      // console.log("coingecko api error: ", e);
    }
    this.currentId++;
    if (this.currentId >= this.coingeckoSymbolIds.length) { this.currentId = 0 }
  }

  getCurrentPriceByChainAndSymbol(chain: string, symbol: string): number {
    if (symbol === "USD" || symbol === "USDC" || symbol === "USDT") return 1;
    for (let i = 0; i < this.coingeckoSymbolIds.length; i++) {
      if (this.coingeckoSymbolIds[i].chain === chain && this.coingeckoSymbolIds[i].symbols.includes(symbol)) {
        return this.coingeckoSymbolIds[i].price;
      }
    }
  }
}