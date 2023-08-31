import WebSocket from "ws";

import { mongoDB, IStoredBot, EBotType, BotTradingDto, events, IStoredAutoBot, ETradingInitiator, ESocketType, ECEXType } from "@torobot/shared";
import { BotClient } from "./botClient"
import { AutoBotClient } from "./autobotClient"
import { VolumeBotClient } from "./volumebotClient"

import { LiquidatorBotClient } from "./liquidatorbotClient"
import { CoinbaseBotClient } from "./coinbasebotClient";
import { KucoinBotClient } from "./kucoinbotClient";

import { WasherBotClient } from "./washerbotClient"
import { CoinbaseWasherBotClient } from "./coinbaseWasherbotClient";
import { KucoinWasherBotClient } from "./kucoinWasherbotClient";
import { TokenCreatorBotClient } from "./tokenCreatorbotClient";

import { logger } from "../utils";

export type BotList = { [id: string]: BotClient }
export const bots: BotList = {};
export type AutoBotList = {[id: string]: AutoBotClient}
export const autobots: AutoBotList = {};
export type VolumeBotList = { [id: string]: VolumeBotClient }
export const volumebots: VolumeBotList = {};

export type LiquidatorBotList = { [id: string]: LiquidatorBotClient }
export const liquidatorbots: LiquidatorBotList = {};
export type CoinbaseBotList = { [id: string]: CoinbaseBotClient }
export const coinbasebots: CoinbaseBotList = {};
export type KucoinBotList = { [id: string]: KucoinBotClient}
export const kucoinbots: KucoinBotList = {};

export type WasherBotList = { [id: string]: WasherBotClient }
export const washerbots: WasherBotList = {};
export type CoinbaseWasherBotList = { [id: string]: CoinbaseWasherBotClient }
export const coinbasewasherbots: CoinbaseWasherBotList = {};
export type KucoinWasherBotList = { [id: string]: KucoinWasherBotClient }
export const kucoinwasherbots: KucoinWasherBotList = {};
export type TokenCreatorBotList = { [id: string]: TokenCreatorBotClient }
export const tokencreatorbots: TokenCreatorBotList = {};

function logPrefix() {
  return `botIndex`;
}

function getBot(botId: string):BotClient {
  return bots[botId];
}

function getAutoBot(botId: string):AutoBotClient {
  return autobots[botId];
}

async function createBot(trading: BotTradingDto, bot: IStoredBot) {
  let botClient = getBot(trading.botId);
  if (!botClient) {
    botClient = new BotClient(bot);
    botClient.on(events.transaction, () => onTransaction(trading.botId));
    botClient.on(events.updated, () => onUpdated(trading.botId));
    botClient.on(events.finished, () => onFinished(trading.botId));
    bots[trading.botId] = botClient;
    await botClient.init();
    await botClient.start(trading.thread);
  }
}

async function deleteBot(botId: string, stop: boolean=false, trading: BotTradingDto=null) {
  const botClient = getBot(botId);
  if (botClient) {
    if (stop) {
      if (!trading.thread) {
        botClient.stop();
      } else {
        botClient.stopThread();
      }
      await onUpdated(botId);
    }  
  }
  if (!trading || !trading.thread || trading.thread && botClient.botThreads.length === 0) {
    if (stop) {
      delete bots[botId];
    }
  }
}

async function onTransaction(botId: string, initiator = ETradingInitiator.BOT) {
  const client = initiator === ETradingInitiator.BOT ? getBot(botId) : getAutoBot(botId);
  if (client) {
    logger.log(logPrefix(), 'info', `onTransaction: ${JSON.stringify(client.transaction)}`);
    await mongoDB.Transactions.create(client.transaction);
  }
}

async function onUpdated(botId: string) {
  const botClient = getBot(botId);
  if (botClient) {
    logger.log(logPrefix(), 'info', `onUpdated: ${botId}, ${botClient.bot.state.status}, ${botClient.bot.state.thread}, ${botClient.bot.state.result}`);
    await mongoDB.Bots.findOneAndUpdate({ _id: botId }, {
      state: botClient.bot.state,
      statistics: botClient.bot.statistics,
    });
  }
}

async function onFinished(botId: string) {
  logger.log(logPrefix(), 'info', `onFinished: ${botId}`);
  await onUpdated(botId);
  await deleteBot(botId);
}

/////////////////////////////////////////////////////////////////////////
export async function triggerBot(trading: BotTradingDto) {
  if (trading.active) {
    const bot: any = await mongoDB.Bots.populateModel(mongoDB.Bots.findById(trading.botId), false);
    await createBot(trading, bot);
  } else {
    await deleteBot(trading.botId, true, trading);
  }
  return trading;
}

export async function startBot(botId: string, type: EBotType ) {
  await mongoDB.Bots.findOneAndUpdate({ _id: botId }, {'state.active': true, type});
  return triggerBot({ botId, active: true});
}

export async function stopBot(botId: string) {
  await mongoDB.Bots.findOneAndUpdate({ _id: botId }, {'state.active': false});
  return triggerBot({ botId, active: false});
}

///testing//////////////////////////////////////////////////////////
// startBot("61c4b8a367479d1cc0d6ae42", EBotType.SELL)
// startBot("61ca3e84aeb0f11ca4d4dbab", EBotType.BUY)
// triggerBot({
//   botId: "61ca3e84aeb0f11ca4d4dbab",
//   active: true,
//   thread: ETradingThread.BUYING_INSTANT
// })

// startBot("61cca450feb72354e0d0dfc2", EBotType.BUY)

// --------------- AUTO BOT ------------------//

export async function triggerAutoBot(botId: string, active: boolean) {
  if (active) {
    await createAutoBot(botId);
    await startAutoBot(botId);
  } else {
    await stopAutoBot(botId);
  }
  return botId;
}

export async function withdrawAutoBotSubWallet(payload: {botId: string}) {
  if (!getAutoBot(payload.botId)) {
    await createAutoBot(payload.botId);
  }

  const autobotClient = getAutoBot(payload.botId);
  return await autobotClient.withdraw();
}

export async function AutoBotSubWalletInfo(botId: string) {
  if (!getAutoBot(botId)) {
    await createAutoBot(botId);
  }

  const autobotClient = getAutoBot(botId);
  const retVal = await autobotClient.getSubWalletInfo();
  console.log("--------> sub wallet info", retVal);

  // removed websocket
  // const wsData = {
  //   type: ESocketType.AUTO_BOT_SUB_WALLET_INFO,
  //   data: {
  //     botId: botId,
  //     walletInfo: retVal
  //   }
  // };
}

async function createAutoBot(botId: string) {
  let autobotClient = getAutoBot(botId);
  if (!autobotClient) {
    const bot: any = await mongoDB.AutoBots.populateModel(mongoDB.AutoBots.findById(botId), false);
    autobotClient = new AutoBotClient(bot);
    autobotClient.on(events.transaction, () => onTransaction(botId, ETradingInitiator.AUTO));
    autobots[botId] = autobotClient;
    await autobotClient.init();
  }
}

async function startAutoBot(botId: string) {
  let autobotClient = getAutoBot(botId);
  if (autobotClient) {
    await autobotClient.start();
  }
}

async function stopAutoBot(botId: string) {
  let autobotClient = getAutoBot(botId);
  if (autobotClient) {
    autobotClient.stop();
    delete autobots[botId];
  }
}

async function deleteAutoBot(botId: string) {
  let autobotClient = getAutoBot(botId);
  if (autobotClient) {
    autobotClient.stop();
    delete autobots[botId];
  }
}

// -------------------- VolumeBot -----------------------------

function getVolumeBot(botId: string): VolumeBotClient {
  return volumebots[botId];
}

async function createVolumeBot(botId: string) {
  let volumebotClient = getVolumeBot(botId);
  if (!volumebotClient) {
    const bot: any = await mongoDB.VolumeBots.populateModel(mongoDB.VolumeBots.findById(botId), false);
    volumebotClient = new VolumeBotClient(bot);
    volumebots[botId] = volumebotClient;
    await volumebotClient.init();
  }
}

export async function startVolumeBot(botId: string) {
  let volumebotClient = getVolumeBot(botId);
  if (volumebotClient) {
    await volumebotClient.start();
  }
}

export async function stopVolumeBot(botId: string) {
  let volumebotClient = getVolumeBot(botId);
  if (volumebotClient) {
    await volumebotClient.stop();
    delete volumebots[botId];
  }
}

export async function triggerVolumeBot(botId: string, active: boolean) {
  if (active) {
    await createVolumeBot(botId);
    await startVolumeBot(botId);
  } else {
    await stopVolumeBot(botId);
  }
  return botId;
}

// -------------------- LiquidatorBot -----------------------------

function getLiquidatorBot(botId: string): LiquidatorBotClient {
  return liquidatorbots[botId];
}

async function createLiquidatorBot(botId: string) {
  let liquidatorbotClient = getLiquidatorBot(botId);
  if (!liquidatorbotClient) {
    const bot: any = await mongoDB.LiquidatorBots.populateModel(mongoDB.LiquidatorBots.findById(botId), false);
    liquidatorbotClient = new LiquidatorBotClient(bot);
    liquidatorbots[botId] = liquidatorbotClient;
    await liquidatorbotClient.init();
  }
}

export async function startLiquidatorBot(botId: string) {
  let liquidatorbotClient = getLiquidatorBot(botId);
  if (liquidatorbotClient) {
    await liquidatorbotClient.start();
  }
}

export async function stopLiquidatorBot(botId: string) {
  let liquidatorbotClient = getLiquidatorBot(botId);
  if (liquidatorbotClient) {
    await liquidatorbotClient.stop();
    delete liquidatorbots[botId];
  }
}

export async function triggerLiquidatorBot(trading: BotTradingDto) {
  console.log("=================>", trading);
  if (trading.active) {
    if (trading.type == EBotType.DEX_LIQUIDATOR) {
      await createLiquidatorBot(trading.botId);
      await startLiquidatorBot(trading.botId);
    } else if (trading.type == EBotType.CEX_LIQUIDATOR) {
      console.log("---------->cex liquidator", trading);
      if (trading.cex === ECEXType.COINBASE) {
        await createCoinbaseBot(trading.botId);
        await startCoinbaseBot(trading.botId);
      } else if (trading.cex === ECEXType.KUCOIN) {
        await createKucoinBot(trading.botId);
        await startKucoinBot(trading.botId);
      }
    }
  } else {
    if (trading.type == EBotType.DEX_LIQUIDATOR) {
      await stopLiquidatorBot(trading.botId);
    } else if (trading.type == EBotType.CEX_LIQUIDATOR) {
      if (trading.cex === ECEXType.COINBASE) {
        await stopCoinbaseBot(trading.botId);
      } else if (trading.cex === ECEXType.KUCOIN) {
        await stopKucoinBot(trading.botId);
      }
    }
  }
  return trading;
}

// Coinbase

function getCoinbaseBot(botId: string): CoinbaseBotClient {
  return coinbasebots[botId];
}

async function createCoinbaseBot(botId: string) {
  let coinbasebotClient = getCoinbaseBot(botId);
  if (coinbasebotClient) {
    await coinbasebotClient.stop();
    delete coinbasebots[botId];
  }
  const bot: any = await mongoDB.LiquidatorBots.populateModel(mongoDB.LiquidatorBots.findById(botId), false);
  coinbasebotClient = new CoinbaseBotClient(bot);
  coinbasebots[botId] = coinbasebotClient;
  await coinbasebotClient.init();
}

export async function startCoinbaseBot(botId: string) {
  let coinbasebotClient = getCoinbaseBot(botId);
  if (coinbasebotClient) {
    await coinbasebotClient.start();
  }
}

export async function stopCoinbaseBot(botId: string) {
  let coinbasebotClient = getCoinbaseBot(botId);
  if (coinbasebotClient) {
    await coinbasebotClient.stop();
    delete coinbasebots[botId];
  }
}

export async function triggerCoinbaseBot(botId: string, active: boolean) {
  if (active) {
    await createCoinbaseBot(botId);
    await startCoinbaseBot(botId);
  } else {
    await stopCoinbaseBot(botId);
  }
  return botId;
}


// Kucoin

function getKucoinBot(botId: string): KucoinBotClient {
  return kucoinbots[botId];
}

async function createKucoinBot(botId: string) {
  let kucoinbotClient = getKucoinBot(botId);
  if (kucoinbotClient) {
    await kucoinbotClient.stop();
    delete kucoinbots[botId];
  }
  const bot: any = await mongoDB.LiquidatorBots.populateModel(mongoDB.LiquidatorBots.findById(botId), false);
  kucoinbotClient = new KucoinBotClient(bot);
  kucoinbots[botId] = kucoinbotClient;
  await kucoinbotClient.init();
}

export async function startKucoinBot(botId: string) {
  let kucoinbotClient = getKucoinBot(botId);
  if (kucoinbotClient) {
    await kucoinbotClient.start();
  }
}

export async function stopKucoinBot(botId: string) {
  let kucoinbotClient = getKucoinBot(botId);
  if (kucoinbotClient) {
    await kucoinbotClient.stop();
    delete kucoinbots[botId];
  }
}

export async function triggerKucoinBot(botId: string, active: boolean) {
  if (active) {
    await createKucoinBot(botId);
    await startKucoinBot(botId);
  } else {
    await stopKucoinBot(botId);
  }
  return botId;
}

// -------------------- WasherBot (DEX)-----------------------------

function getWasherBot(botId: string): WasherBotClient {
  return washerbots[botId];
}

async function createWasherBot(botId: string) {
  let washerbotClient = getWasherBot(botId);
  if (washerbotClient) {
    stopWasherBot(botId);
  }
  const bot: any = await mongoDB.WasherBots.populateModel(mongoDB.WasherBots.findById(botId), false);
  washerbotClient = new WasherBotClient(bot);
  washerbots[botId] = washerbotClient;    
  await washerbotClient.init();
}

export async function startWasherBot(botId: string) {
  let washerbotClient = getWasherBot(botId);
  if (washerbotClient) {
    await washerbotClient.start();
  }
}

export async function stopWasherBot(botId: string) {
  let washerbotClient = getWasherBot(botId);
  if (washerbotClient) {
    await washerbotClient.stop();
    delete washerbots[botId];
  }
}

export async function triggerWasherBot(trading: BotTradingDto) {
  if (trading.active) {
    if (trading.type == EBotType.DEX_WASHER) {
      await createWasherBot(trading.botId);
      await startWasherBot(trading.botId);
    } else if (trading.type == EBotType.CEX_WASHER) {
      console.log("---------->cex washer", trading);
      if (trading.cex === ECEXType.COINBASE) {
        await createCoinbaseWasherBot(trading.botId);
        await startCoinbaseWasherBot(trading.botId);
      } else if (trading.cex === ECEXType.KUCOIN) {
        await createKucoinWasherBot(trading.botId);
        await startKucoinWasherBot(trading.botId);
      }
      
    }
  } else {
    if (trading.type == EBotType.DEX_WASHER) {
      await stopWasherBot(trading.botId);
    } else if (trading.type == EBotType.CEX_WASHER) {
      if (trading.cex === ECEXType.COINBASE) {
        await stopCoinbaseWasherBot(trading.botId);
      } else if (trading.cex === ECEXType.KUCOIN) {
        await stopKucoinWasherBot(trading.botId);
      }
      
    }
  }
  return trading;
}

export async function withdrawWasherBotSubWallet(payload: {botId: string}) {
  if (!getWasherBot(payload.botId)) {
    await createWasherBot(payload.botId);
  }
  const washerbotClient = getWasherBot(payload.botId);
  return await washerbotClient.withdraw();
}

// CoinbaseWasher

function getCoinbaseWasherBot(botId: string): CoinbaseWasherBotClient {
  return coinbasewasherbots[botId];
}

async function createCoinbaseWasherBot(botId: string) {
  let coinbasewasherbotClient = getCoinbaseWasherBot(botId);
  if (coinbasewasherbotClient) {
    await coinbasewasherbotClient.stop();
    delete coinbasewasherbots[botId];
    console.log(coinbasewasherbots[botId]);
  }
  
  const bot: any = await mongoDB.WasherBots.populateModel(mongoDB.WasherBots.findById(botId), false);
  console.log(bot);
  coinbasewasherbotClient = new CoinbaseWasherBotClient(bot);
  coinbasewasherbots[botId] = coinbasewasherbotClient;
  await coinbasewasherbotClient.init();
}

export async function startCoinbaseWasherBot(botId: string) {
  let coinbasewasherbotClient = getCoinbaseWasherBot(botId);
  if (coinbasewasherbotClient) {
    await coinbasewasherbotClient.start();
  }
}

export async function stopCoinbaseWasherBot(botId: string) {
  let coinbasewasherbotClient = getCoinbaseWasherBot(botId);
  if (coinbasewasherbotClient) {
    await coinbasewasherbotClient.stop();
    delete coinbasewasherbots[botId];
  }
}

// KucoinWasher

function getKucoinWasherBot(botId: string): KucoinWasherBotClient {
  return kucoinwasherbots[botId];
}

async function createKucoinWasherBot(botId: string) {
  let kucoinwasherbotClient = getKucoinWasherBot(botId);
  if (kucoinwasherbotClient) {
    await kucoinwasherbotClient.stop();
    delete kucoinwasherbots[botId];
  }
  
  const bot: any = await mongoDB.WasherBots.populateModel(mongoDB.WasherBots.findById(botId), false);
  kucoinwasherbotClient = new KucoinWasherBotClient(bot);
  kucoinwasherbots[botId] = kucoinwasherbotClient;
  await kucoinwasherbotClient.init();
}

export async function startKucoinWasherBot(botId: string) {
  let kucoinwasherbotClient = getKucoinWasherBot(botId);
  if (kucoinwasherbotClient) {
    await kucoinwasherbotClient.start();
  }
}

export async function stopKucoinWasherBot(botId: string) {
  let kucoinwasherbotClient = getKucoinWasherBot(botId);
  if (kucoinwasherbotClient) {
    await kucoinwasherbotClient.stop();
    delete kucoinwasherbots[botId];
  }
}

// Token Creator
function getTokenCreatorBot(botId: string): TokenCreatorBotClient {
  return tokencreatorbots[botId];
}

async function createTokenCreatorBot(botId: string) {
  const bot: any = await mongoDB.TokenCreators.populateModel(mongoDB.TokenCreators.findById(botId), false);
  const tokencreatorbotClient = new TokenCreatorBotClient(bot);
  if (tokencreatorbots[botId]) {
    delete tokencreatorbots[botId];
  }
  tokencreatorbots[botId] = tokencreatorbotClient;
  await tokencreatorbotClient.init();
}

export async function createToken(payload: {botId: string}) {
  if (!getTokenCreatorBot(payload.botId)) {
    await createTokenCreatorBot(payload.botId);
  }
  const tokencreatorbotClient = getTokenCreatorBot(payload.botId);
  return await tokencreatorbotClient.create();
}

export async function mintToken(payload: {botId: string, amount: string}) {
  await createTokenCreatorBot(payload.botId);
  const tokencreatorbotClient = getTokenCreatorBot(payload.botId);
  return await tokencreatorbotClient.tokenMint(payload.amount);
}

export async function burnToken(payload: {botId: string, amount: string}) {
  await createTokenCreatorBot(payload.botId);
  const tokencreatorbotClient = getTokenCreatorBot(payload.botId);
  return await tokencreatorbotClient.tokenBurn(payload.amount);
}

export async function addLP(payload: {botId: string, baseCoinAddress: string, baseCoinAmount: string, tokenAmount: string, dexId: string}) {
  await createTokenCreatorBot(payload.botId);
  const tokencreatorbotClient = getTokenCreatorBot(payload.botId);
  return await tokencreatorbotClient.addLP(payload.baseCoinAddress, payload.baseCoinAmount, payload.tokenAmount, payload.dexId);
}

export async function removeLP(payload: {botId: string, baseCoinAddress: string, lpAddress: string, lpAmount: string, dexId: string}) {
  await createTokenCreatorBot(payload.botId);
  const tokencreatorbotClient = getTokenCreatorBot(payload.botId);
  return await tokencreatorbotClient.removeLP(payload.baseCoinAddress, payload.lpAddress, payload.lpAmount, payload.dexId);
}