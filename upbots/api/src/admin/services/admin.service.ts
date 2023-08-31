/* eslint-disable no-param-reassign */
/* eslint-disable radix */
/* eslint-disable no-underscore-dangle */
import { HttpService, Inject, Injectable, Logger, CACHE_MANAGER } from "@nestjs/common";
import { Model, Types } from "mongoose";
import { Cache } from "cache-manager";
import { InjectModel } from "@nestjs/mongoose";
import { Cron } from "@nestjs/schedule";
import * as Discord from "discord.js";
import * as stringHash from "string-hash";
import * as dayjs from "dayjs";

import { StringifyOptions } from "querystring";
import { User, UserDto, UserIdentity } from "../../types/user";
import { AlgoBotModel } from "../../algobot/models/algobot.model";
import { AlgoBotSubscriptionModel } from "../../algobot/models/algobot-subscription.model";
import { SignalTrackingModelName } from "../../algobot/models/signal-tracking.schema";
import { SignalTrackingDto, SignalTrackingModel } from "../../algobot/models/signal-tracking.dto";
import TradeBalanceService from "../../portfolio/services/trade-balance.service";
import ExchangeKeyService from "../../exchange-key/services/exchange-key.service";
import CurrentPriceService from "../../cryptoprice/price-summary.service";

import { OrderTrackingModelName, OrderTrackingModel } from "../../trade/model/order-tracking.schema";

import * as UserWallet from "../../perfees/models/user-wallet.model";
import * as UserWalletTracking from "../../perfees/models/user-wallet-tracking.model";
import * as BotWallet from "../../perfees/models/bot-wallet.model";
import * as UserTransaction from "../../perfees/models/user-transaction.model";
import * as FeeWallet from "../../perfees/models/fee-wallet.model";
import * as FeeTransaction from "../../perfees/models/fee-transaction.model";
import * as FeeTracking from "../../perfees/models/fee-tracking.model";

const discordBotName = process.env.DISCORD_BOT_NAME ?? "UpBots_test";
const discordGuildId = process.env.DISCORD_GUILD_ID ?? "926371700529057814";
const discordBotToken = process.env.DISCORD_BOT_TOKEN ?? "OTI3NDgzMzUxODU2NzA5NjMy.YdK4Lg.32seWQ7tzzRh7wD-hKENWRXfLMQ";

const intents = new Discord.Intents([
  Discord.Intents.NON_PRIVILEGED,
  Discord.Intents.FLAGS.GUILD_PRESENCES,
  Discord.Intents.FLAGS.GUILD_MEMBERS,
  Discord.Intents.FLAGS.GUILDS,
  Discord.Intents.FLAGS.DIRECT_MESSAGES,
]);
const client = new Discord.Client({ ws: { intents } } as Discord.ClientOptions);

@Injectable()
export default class AlgobotsAdminService {
  private readonly logger = new Logger(AlgobotsAdminService.name);

  constructor(
    @InjectModel("User") private userModel: Model<User>,
    @InjectModel("AlgoBot") private botModel: Model<AlgoBotModel>,
    @InjectModel("AlgoBotSubscription") private botSubscriptionModel: Model<AlgoBotSubscriptionModel>,
    @InjectModel(SignalTrackingModelName) private signalTrackingModel: Model<SignalTrackingModel>,
    @InjectModel(OrderTrackingModelName) private OrderTrackModel: Model<OrderTrackingModel>,
    @InjectModel(UserWallet.ModelName) private UserWalletModel: Model<UserWallet.Model>,
    @InjectModel(BotWallet.ModelName) private BotWalletModel: Model<BotWallet.Model>,
    @InjectModel(UserTransaction.ModelName) private UserTransactionModel: Model<UserTransaction.Model>,
    @InjectModel(FeeWallet.ModelName) private FeeWalletModel: Model<FeeWallet.Model>,
    @InjectModel(FeeTransaction.ModelName) private FeeTransactionModel: Model<FeeTransaction.Model>,
    @InjectModel(FeeTracking.ModelName) private FeeTrackingModel: Model<FeeTracking.Model>,

    private tradeBalanceService: TradeBalanceService,
    private exchKeyService: ExchangeKeyService,
    private priveSvc: CurrentPriceService
  ) {
    client.on("ready", () => {
      client.user.setActivity({
        name: discordBotName,
        type: "STREAMING",
      });
    });

    client.login(discordBotToken).catch((err) => {
      this.logger.error(`discord login error: ${err}`);
    });
  }

  onModuleInit() {}

  sendDiscordMassMessages(message: string) {
    // Fetch Guild
    const guild = client.guilds.cache.get(discordGuildId);
    if (guild) {
      // guild.members.cache.each(u => {
      //   u.send(message).then((msg) => {
      //     this.logger.debug(`Message to ${u.user.username}: ${msg}`);
      //   }).catch((err) => {
      //     this.logger.error(err);
      //   });
      // });
      guild.members.fetch().then((members) => {
        members.each((u) => {
          u.send(message)
            .then((msg) => {
              this.logger.debug(`Message to ${u.user.username}: ${msg}`);
            })
            .catch((err) => {
              this.logger.error(err);
            });
        });
      });
    }
  }

  async getUser(data: any): Promise<any> {
    try {
      const { email, userId } = data;
      let user = null;

      if (email) {
        user = await this.userModel.findOne({ email });
      } else {
        user = await this.userModel.findOne({ _id: userId });
      }
      return {
        user,
      };
    } catch (e) {
      return {
        error: true,
        message: e.message,
      };
    }
  }

  async getBotSignals(botIds?: []) {
    const webhookSecrets = process.env.WEBHOOK_SECRET.split(" ");
    let algobots = [];
    if (botIds && botIds.length > 0) {
      algobots = await this.botModel.find({ _id: { $in: botIds } });
    } else {
      algobots = await this.botModel.find({});
    }

    const promises = algobots.map(async (algobot) => {
      const lastSignalTracking = await this.signalTrackingModel
        .findOne({ botId: algobot._id })
        .sort({ signalDateTime: -1, botCycle: -1, botVer: -1, position: 1 });
      const creatorHash = await stringHash(algobot.creator);
      return {
        id: algobot._id,
        ref: algobot.botRef,
        name: algobot.name,
        creator: algobot.creator,
        position: lastSignalTracking?.position,
        base: lastSignalTracking?.base,
        quote: lastSignalTracking?.quote,
        cycle: lastSignalTracking?.botCycle,
        signalDateTime: lastSignalTracking?.signalDateTime,
        secret: `${webhookSecrets[0]}.upbots.${creatorHash}`,
      };
    });
    const result = await Promise.all(promises);
    return result;
  }

  async getSubscriptionBalances(userId: string, apiKeyRef: string, base: string, quote: string) {
    const exchKey = await this.exchKeyService.findOneKeyForDisplay(apiKeyRef);
    if (!exchKey.id) {
      return {
        error: `couldn't find key: ${apiKeyRef}`,
      };
    }
    const accountBalances = await this.tradeBalanceService.getBalanceForTrading(userId, apiKeyRef);
    const baseAmount = accountBalances.freeBalances && accountBalances.freeBalances[base];
    const quoteBalance = accountBalances.freeBalances && accountBalances.freeBalances[quote];
    const baseBalance = 0;
    return {
      baseAmount,
      baseBalance,
      quoteBalance,
    };
  }

  async getBotSubscriptions(botId: string, userIds: [], statusNot: number, botRunningNot: boolean, condSubs: boolean, others?: any) {
    let conditions: any = { botId, deleted: false };

    if (userIds.length > 0) {
      conditions = { ...conditions, userId: { $in: userIds } };
    }
    if (condSubs) {
      conditions = { ...conditions, $or: [{ botRunning: { $ne: botRunningNot } }, { status: { $ne: statusNot } }] };
    }
    if (others) {
      conditions = { ...conditions, ...others };
    }
    const botSubscriptions = await this.botSubscriptionModel.find(conditions).sort({ createdAt: 1 });

    const result = botSubscriptions.map((sub: any) => {
      return {
        id: sub._id,
        userId: sub.userId,
        apiKeyRef: sub.apiKeyRef,
        enabled: sub.enabled,
        botRunning: sub.botRunning,
        status: sub.status,
        accountType: sub.accountType,
        stratType: sub.stratType,
        positionType: sub.positionType,
        positionAmount: sub.positionAmount,
        accountPercent: sub.accountPercent,
        cycleSequence: sub.cycleSequence,
        openedQuantity: sub.openedQuantity,
        error: sub.error,
        errorReason: sub.errorReason,
        errorAt: sub.errorAt,
        updatedAt: sub.updatedAt,
      };
    });
    return result;
  }

  async updateBotSubscription(subId: string, status?: number, botRunning?: boolean) {
    const condition = { _id: subId };
    let payload = {};

    if (status !== undefined && status !== null) {
      payload = { ...payload, status };
    }

    if (botRunning !== undefined && botRunning !== null) {
      payload = { ...payload, botRunning };
    }

    await this.botSubscriptionModel.updateOne(condition, payload);
  }

  async getUserBotSubscriptions(botIds?: [], userIds?: [], condSubs?: boolean, userBalance?: boolean, userEmails?: boolean, others?: any) {
    const algobots = await this.getBotSignals(botIds);

    const promises = algobots.map(async (algobot) => {
      const status = algobot.position === "open" ? 3 : 4;
      const botRunning = algobot.position === "open";
      const botSubscriptions = await this.getBotSubscriptions(algobot.id, userIds || [], status, botRunning, condSubs, others);
      let subs = [];
      let basePrice = 0;

      try {
        const price = await this.priveSvc.getCurrentPriceSummary("binance", algobot.base + algobot.quote);
        basePrice = price.result?.price?.last;
      } catch (e) {
        console.log("--getUserBotSubscriptions@price-catch-err:", e.message);
      }

      if (userBalance) {
        // status different
        const subsBalancePromises = botSubscriptions.map(async (sub) => {
          const balances = await this.getSubscriptionBalances(sub.userId, sub.apiKeyRef, algobot.base, algobot.quote);
          balances.baseBalance = balances.baseAmount * basePrice;
          return {
            ...sub,
            balances,
          };
        });
        subs = await Promise.all(subsBalancePromises);
      } else {
        subs = botSubscriptions;
      }

      const users = subs.map((sub) => sub.userId);
      let emails = [];
      if (userEmails) {
        const userEmailsPromise = users.map(async (userId) => {
          const user = await this.getUser({ userId });
          return user.user.email;
        });
        emails = await Promise.all(userEmailsPromise);
      }

      return {
        ...algobot,
        basePrice,
        users,
        emails: userEmails ? emails : [],
        subs,
      };
    });
    const result = await Promise.all(promises);
    const filteredAlgobots = result.filter((algobot) => algobot.users.length);
    return filteredAlgobots;
  }

  async updateUserBotSubscriptions(botIds?: [], userIds?: [], condSubs?: boolean, userBalance?: boolean, updateMode?: string) {
    const algobots = await this.getUserBotSubscriptions(botIds, userIds, condSubs, userBalance);
    if (updateMode === "sub" || updateMode === "all" || updateMode === "open" || updateMode === "close") {
      const promises = algobots.map(async (algobot) => {
        const status = algobot.position === "open" ? 3 : 4;
        const botRunning = algobot.position === "open";
        const botSubscriptions = algobot.subs;
        const subsBalancePromises = botSubscriptions.map(async (sub) => {
          if (updateMode === "sub") {
            const subStatus = sub.botRunning ? 3 : 4;
            await this.updateBotSubscription(sub.id, subStatus, sub.botRunning);
          } else if (updateMode === "all") {
            await this.updateBotSubscription(sub.id, status, botRunning);
          } else if (updateMode === "open") {
            await this.updateBotSubscription(sub.id, 3, true);
          } else if (updateMode === "close") {
            await this.updateBotSubscription(sub.id, 4, false);
          }
        });
        await Promise.all(subsBalancePromises);
      });
      const result = await Promise.all(promises);
      return { result: "OK" };
    }
    return algobots;
  }

  async updateUserBotSubscription(subId: string, payload: any) {
    const condition = { _id: subId };
    try {
      await this.botSubscriptionModel.updateOne(condition, payload);
      return true;
    } catch (e) {
      return false;
    }
  }

  async fixUserBotSubscriptions(botIds?: [], userIds?: [], fixFlag?: boolean) {
    const algobots = await this.getBotSignals(botIds);

    const promises = algobots.map(async (algobot) => {
      const botSubscriptions = await this.getBotSubscriptions(algobot.id, userIds || [], 0, false, false);
      const mappedBotSubs = await Promise.all(
        botSubscriptions.map(async (botSub) => {
          const orders = await this.OrderTrackModel.find({ botSubId: botSub.id }).sort({ created_at: 1 });
          const filteredOrders = [];
          let curCycleSequence = 0;
          orders.forEach((order) => {
            if (order.ctxBot === "open") {
              curCycleSequence += 1;
            }
            if (curCycleSequence > 0) {
              if (order.cycleSequence !== curCycleSequence) {
                order.cycleSequence = curCycleSequence;
                filteredOrders.push(order);
              }
            }
          });
          const mappedOrders = filteredOrders.map((order) => ({
            id: order.id,
            cycleSequence: order.cycleSequence,
            ctxBot: order.ctxBot,
            side: order.side,
            stratType: order.stratType,
            created_at: order.created_at,
            updated_at: order.updated_at,
          }));

          if (fixFlag) {
            await this.botSubscriptionModel.update({ _id: botSub.id }, { cycleSequence: curCycleSequence });
            await Promise.all(
              filteredOrders.map(async (order) => {
                await this.OrderTrackModel.update({ _id: order.id }, { cycleSequence: order.cycleSequence });
              })
            );
          }

          return {
            ...botSub,
            maxCycleSequence: curCycleSequence,
            orders: mappedOrders,
          };
        })
      );

      const filteredBotSubs = mappedBotSubs.filter((botSub) => botSub.orders.length > 0);
      const users = filteredBotSubs.map((sub) => sub.userId);
      return {
        ...algobot,
        subs: filteredBotSubs,
        users,
      };
    });
    const result = await Promise.all(promises);
    const filteredAlgobots = result.filter((algobot) => algobot.users.length);
    return filteredAlgobots;
  }

  async closeUserBotSubscriptions(botIds?: [], userIds?: []) {
    const algobots = await this.getBotSignals(botIds);

    const promises = algobots.map(async (algobot) => {
      const botSubscriptions = await this.getBotSubscriptions(algobot.id, userIds || [], 0, false, false);
      const mappedBotSubs = await Promise.all(
        botSubscriptions.map(async (botSub) => {
          const botSubscription = await this.botSubscriptionModel.findById(botSub.id);
          if (!botSubscription) {
            return null;
          }
          const userWallet = await this.UserWalletModel.findOne({ userId: botSub.userId });
          const botWallet = await this.BotWalletModel.findOne({ botId: algobot.id, userId: botSub.userId });
          if (!userWallet || !botWallet) {
            botSubscription.enabled = false;
            botSubscription.deleted = true;
            botSubscription.openedQuantity = 0;
            await botSubscription.save();
            return userWallet;
          }
          userWallet.amount += botWallet.amount;
          userWallet.availableAmount += botWallet.amount;
          userWallet.allocatedAmount = Math.max(0, userWallet.amount - userWallet.availableAmount);
          botWallet.amount = 0;
          botWallet.creditAmount = 0;
          botWallet.debtAmount = 0;
          botSubscription.enabled = false;
          botSubscription.deleted = true;
          botSubscription.openedQuantity = 0;
          await botSubscription.save();
          await userWallet.save();
          await botWallet.save();
          return userWallet;
        })
      );
      return mappedBotSubs;
    });
    const result = await Promise.all(promises);
    return result;
  }

  async getUserBotOrders(subId: string, count: number) {
    const condition = { botSubId: subId };
    try {
      const result = await this.OrderTrackModel.find(condition, null, {
        sort: { updated_at: -1 },
      }).limit(count);
      return result;
    } catch (e) {
      return [];
    }
  }

  async closeUserBotOrder(orderId: string) {
    try {
      const openOrder = await this.OrderTrackModel.findById({ _id: orderId });
      if (!openOrder) {
        return false;
      }
      const openOrderData = openOrder.toJSON();
      openOrderData.side = openOrder.side === "Buy" ? "Sell" : "Buy";
      openOrderData.ctxBot = "close";
      openOrderData.priceAsked = 0;
      openOrderData.qtyBaseAsked = 0;
      openOrderData.qtyQuoteAsked = 0;
      openOrderData.completion.qExec = 0;
      openOrderData.completion.pExec = 0;
      openOrderData.completion.cumulQuoteCost = 0;
      delete openOrderData._id;
      delete openOrderData.id;
      // delete openOrderData.created_at;
      // delete openOrderData.updated_at;
      let closeOrder = new this.OrderTrackModel(openOrderData);
      closeOrder = await closeOrder.save();
      return closeOrder;
    } catch (e) {
      return e.message;
    }
  }

  async getTransactions(data: any): Promise<any> {
    try {
      let { userId } = data;
      const { email, botId } = data;
      if (email) {
        const user = await this.userModel.findOne({ email });
        userId = user._id;
      }

      const limit = data.count || 10;
      const transactions = await this.UserTransactionModel.find({ userId }, null, { sort: { createdAt: -1 } }).limit(limit);
      return transactions;
    } catch (e) {
      return {
        error: true,
        message: e.message,
      };
    }
  }

  async getWallets(data: any): Promise<any> {
    try {
      let { userId } = data;
      const { email, botId } = data;
      if (email) {
        const user = await this.userModel.findOne({ email });
        userId = user._id;
      }

      const userWallet = await this.UserWalletModel.findOne({ userId });
      let botWallets = {};
      let feeWallets = {};

      if (botId) {
        botWallets = await this.BotWalletModel.find({ userId, botId });
        feeWallets = await this.FeeWalletModel.find({ botId });
      } else {
        botWallets = await this.BotWalletModel.find({ userId }, null, { sort: { createdAt: -1 } });
        feeWallets = await this.FeeWalletModel.find({});
      }
      return {
        userWallet,
        botWallets,
        feeWallets,
      };
    } catch (e) {
      return {
        error: true,
        message: e.message,
      };
    }
  }

  async setUserWallet(data: any): Promise<any> {
    try {
      let { userId } = data;
      const { email, arrangeWallet } = data;
      if (email) {
        const user = await this.userModel.findOne({ email });
        userId = user._id;
      }

      await this.UserWalletModel.findOneAndUpdate({ userId }, data.update);
      if (arrangeWallet) {
        await this.arrangeUserWallet(userId);
      }
      return await this.UserWalletModel.findOne({ userId });
    } catch (e) {
      return {
        error: true,
        message: e.message,
      };
    }
  }

  async arrangeUserWallet(userId: string): Promise<boolean> {
    try {
      const userWallet = await this.UserWalletModel.findOne({ userId });
      const botWalletTotal = await this.BotWalletModel.aggregate([
        {
          $match: {
            status: { $eq: "ENABLED" },
            userId: { $eq: Types.ObjectId(userId) },
          },
        },
        { $group: { _id: null, amount: { $sum: "$amount" } } },
      ]);
      if (!userWallet || !botWalletTotal || !botWalletTotal.length) {
        return false;
      }
      const allocatedAmount = botWalletTotal[0].amount;
      userWallet.allocatedAmount = Math.min(userWallet.amount, allocatedAmount);
      userWallet.availableAmount = userWallet.amount - userWallet.allocatedAmount;
      await userWallet.save();
      return true;
    } catch (e) {
      return false;
    }
  }

  async fixUserWallets(data: any): Promise<any> {
    try {
      const { userIds, skip, limit, fixFlag } = data;
      let conditions: any = {};

      if (userIds.length > 0) {
        conditions = { ...conditions, _id: { $in: userIds } };
      }

      const userCount = await this.userModel.countDocuments();
      const users = await this.userModel.find(conditions).skip(skip).limit(limit);
      const userWallets = await Promise.all(
        users.map(async (user) => {
          const wallets = await this.UserWalletModel.find({ userId: user._id }).sort({ amount: -1 });
          return {
            id: user._id,
            email: user.email,
            wallets,
          };
        })
      );
      const filteredWallets = userWallets.filter((userWallet) => userWallet.wallets.length > 1);
      if (fixFlag) {
        filteredWallets.map((userWallet) => {
          userWallet.wallets.shift();
          return false;
        });
        await Promise.all(
          filteredWallets.map(async (userWallet) => {
            await Promise.all(
              userWallet.wallets.map(async (wallet) => {
                await this.UserWalletModel.deleteOne({ _id: wallet._id });
              })
            );
          })
        );
        await Promise.all(
          filteredWallets.map(async (userWallet) => {
            await this.arrangeUserWallet(userWallet.id);
            return false;
          })
        );
      }

      return {
        totalUsers: userCount,
        items: filteredWallets,
      };
    } catch (e) {
      return {
        error: true,
        message: e.message,
      };
    }
  }

  async getExchanges(data: any): Promise<any> {
    try {
      const { userId } = data;

      const exchCredentials = await this.exchKeyService.getDecryptedExchangeCredentials(userId);
      const exchAmounts = Promise.all(
        exchCredentials.map(async (exch) => {
          const accountBalances = await this.tradeBalanceService.getBalanceForTrading(userId, exch.id);
          return {
            exch,
            accountBalances,
          };
        })
      );

      return exchAmounts;
    } catch (e) {
      return {
        error: true,
        message: e.message,
      };
    }
  }

  async getUsersBySubscription(data: any): Promise<any> {
    try {
      const { subscription, exch } = data;
      const botSubscriptions = await this.botSubscriptionModel.find(subscription);

      const botSubscriptionsMapper = botSubscriptions.map(async (sub) => {
        const bot = await this.botModel.findOne({ _id: sub.botId });
        const user = await this.userModel.findOne({ _id: sub.userId });
        const exchKey = await this.exchKeyService.findOneKeyForDisplay(sub.apiKeyRef);
        return {
          user: user?.email,
          botName: bot.name,
          exchange: exchKey.exchange,
        };
      });
      const mappedBotSubscriptions = await Promise.all(botSubscriptionsMapper);

      const botSubscriptionsFilter = mappedBotSubscriptions.filter((item) => {
        if (!exch) {
          return true;
        }
        return exch.exchange === item.exchange;
      });
      const filteredBotSubscriptions = await Promise.all(botSubscriptionsFilter);
      return filteredBotSubscriptions;
    } catch (e) {
      return {
        error: true,
        message: e.message,
      };
    }
  }

  async getAlgoBot(botId: string) {
    const condition = { _id: botId };
    try {
      return this.botModel.findById(botId);
    } catch (e) {
      return false;
    }
  }

  async updateAlgoBot(botId: string, payload: any) {
    const condition = { _id: botId };
    try {
      await this.botModel.updateOne(condition, payload);
      return true;
    } catch (e) {
      return false;
    }
  }

  async getAlgobotLastTrades(botId: string, config: any) {
    try {
      const signalTracking = await this.signalTrackingModel
        .findOne({ botId, position: "open" })
        .sort({ signalDateTime: -1, botCycle: -1, botVer: -1, position: 1 });
      if (!signalTracking) {
        return {
          error: "Invalid signal Tracking",
        };
      }
      const minSignalTrackingTime = dayjs(signalTracking.signalDateTime).subtract(1, "hour");

      // bot total users
      const subscriptions = await this.botSubscriptionModel.find({ botId, deleted: { $ne: true } });
      let lastTradeAmount = 0;
      const orderTrackingPromise = subscriptions.map(async (subscription) => {
        const orderTrackings = await this.OrderTrackModel.find({
          botSubId: subscription._id,
          cycleSequence: subscription.cycleSequence,
          ctxBot: "open",
          completed: true,
          created_at: {
            $gte: new Date(minSignalTrackingTime.toISOString()),
          },
        });
        const orderTrackingVals = orderTrackings.map((orderTracking) => {
          if (orderTracking.completed) {
            lastTradeAmount = lastTradeAmount + orderTracking?.completion?.cumulQuoteCost || 0;
          }
          return {
            id: orderTracking._id,
            cumulQuoteCost: orderTracking.completion.cumulQuoteCost,
            createdAt: orderTracking.created_at,
          };
        });
        return {
          userId: subscription.userId,
          botSubId: subscription._id,
          cycleSequence: subscription.cycleSequence,
          orderTrackings: orderTrackingVals,
        };
      });
      const subscriptionVals = await Promise.all(orderTrackingPromise);
      return {
        signalDateTime: signalTracking.signalDateTime,
        lastTradeAmount,
        subscriptions: subscriptionVals,
      };
    } catch (e) {
      return false;
    }
  }
}
