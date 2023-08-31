/* eslint-disable import/prefer-default-export */

import { Types } from "mongoose";
import { AlgoBotSubscriptionModel } from "../../algobot/models/algobot-subscription.model";
import { AlgoBotModel } from "../../algobot/models/algobot.model";

export const copybotSeedData = [
  {
    name: "CopyBot1",
    botRef: "COPYBOT_REF1", // seed identifier
    botVer: "1",
    description: "Copybot desc1",
    stratType: "LONG_SHORT",
    category: "copybot",
    enabled: true,
    owner: new Types.ObjectId("5ffffcfdb44fdb4239f369c9"),
    market: { base: "BTC", quote: "USDT" },
    creator: "4C-Trading",
    avgtrades: 9,
    allocated: { maxamount: 50000, currency: "USDT" },
    ratings: 4.2,
    reviews: { username: "Elena", userimg: "/img/bots-card/user-img.png", botrating: 5.0 },
    perfFees: {
      percent: 20,
      address: "0xE11DCFB83BEbDE864a930128558eF28fd76d7446",
      distribution: { developer: 6.75, burn: 3.375, pool: 3.375, reserve: 6.5 },
    },
    exchangesType: ["FTX", "Binance", "KuCoin", "Huobi", "Coinbasepro", "KuCoin-future", "Binance-future", "Ftx-future"],
    priceDecimal: 2,
  } as AlgoBotModel,
  {
    name: "CopyBot2-Ben",
    botRef: "COPYBOT_REF2", // seed identifier
    botVer: "1",
    description: "Copybot desc2",
    stratType: "LONG",
    category: "copybot",
    enabled: true,
    owner: new Types.ObjectId("5ffffcfdb44fdb4239f369c9"),
    market: { base: "BTC", quote: "USDT" },
    creator: "4C-Trading",
    avgtrades: 9,
    allocated: { maxamount: 50000, currency: "USDT" },
    ratings: 4.2,
    reviews: { username: "Elena", userimg: "/img/bots-card/user-img.png", botrating: 5.0 },
    perfFees: {
      percent: 20,
      address: "0xE11DCFB83BEbDE864a930128558eF28fd76d7446",
      distribution: { developer: 6.75, burn: 3.375, pool: 3.375, reserve: 6.5 },
    },
    exchangesType: ["FTX", "Binance", "KuCoin", "Huobi"],
    priceDecimal: 2,
  } as AlgoBotModel,
];
