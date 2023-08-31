/* eslint-disable no-restricted-syntax */
/* eslint-disable import/prefer-default-export */
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  WsResponse,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Logger, UseFilters } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as sio from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { ExtractJwt } from "passport-jwt";
import * as bcrypt from "bcryptjs";
import { Model } from "mongoose";
import * as TelegramBot from "node-telegram-bot-api";
import { OrderTrackingModelName, OrderTrackingModel } from "../trade/model/order-tracking.schema";
import { PerformanceCycleModel } from "../performance/models/performance.models";
import * as BotWallet from "../perfees/models/bot-wallet.model";
import * as FeeTracking from "../perfees/models/fee-tracking.model";
import { AlgoBotModel } from "../algobot/models/algobot.model";
import WsAllExceptionFilter from "../shared/ws-exception.filter";
import OrderEventPayload from "./models/order-event.payload";
import wsOptions from "./websocket.options";
import { JwtPayload } from "../types";
import { User, UserIdentity } from "../types/user";
import AuthService from "../auth/auth.service";
import SocketSessionService from "./services/user-socket-session.service";
import MailService from "../shared/mail.service";

const TG_ICONS = {
  ENEVLOPE: "\u2709\ufe0f",
  STOP: "\ud83d\udeab",
  CONGRATS: "\ud83c\udf89",
  SEPARATOR:
    "\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014",
  GRAPH: "\ud83d\udcc8",
  EXCLAMATION: "\u26a0\ufe0f",
  ROCKET: "\ud83d\ude80",
  BELL: "\ud83d\udd14",
  HYPHEN: "\u2014",
  TIMES: "\u274c",
  CHECK: "\u2705",
};

@WebSocketGateway(wsOptions)
@UseFilters(new WsAllExceptionFilter())
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(WebsocketGateway.name);

  private bot =
    process.env.TELEGRAM_BOT_ACCESS_TOKEN && process.env.DISABLE_CRON_JOBS && process.env.DISABLE_CRON_JOBS === "true"
      ? new TelegramBot(process.env.TELEGRAM_BOT_ACCESS_TOKEN, { polling: true })
      : null;

  private chatTrack = {};

  constructor(
    @InjectModel("User") private userModel: Model<User>,
    @InjectModel(OrderTrackingModelName) private orderTrackingModel: Model<OrderTrackingModel>,
    @InjectModel("PerformanceCyclesModel1") private performanceCyclesModel: Model<PerformanceCycleModel>,
    @InjectModel(BotWallet.ModelName) private BotWalletModel: Model<BotWallet.Model>,
    @InjectModel(FeeTracking.ModelName) private FeeTrackingModel: Model<FeeTracking.Model>,
    @InjectModel("AlgobotsModel") private botModel: Model<AlgoBotModel>,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly session: SocketSessionService,
    private mailService: MailService
  ) {
    if (this.bot) {
      this.logger.debug("Initializing the telegram bot...");
      this.bot.onText(/\/start/, async (msg, match) => {
        this.bot.sendMessage(
          msg.chat.id,
          `Hi, ${msg.chat.first_name}!
1. To subscribe the Telegram notification, please click the "*Connect*" button, then input your _email address_ registered to the Upbots.
2. If you already have subscribed, please click the "*Confirm*" button, then input the _confirm code_ received via mail.
          `,
          {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: `${TG_ICONS.ENEVLOPE} Connect to Upbots`,
                    callback_data: "cmd_subscribe",
                  },
                  {
                    text: `${TG_ICONS.CHECK} Confirm code`,
                    callback_data: "cmd_confirm",
                  },
                ],
              ],
            },
          }
        );
      });
      this.bot.on("callback_query", (qry) => {
        const msg = qry.message;
        switch (qry.data) {
          case "cmd_subscribe":
            this.bot.answerCallbackQuery(qry.id).then(() => {
              this.bot.sendMessage(msg.chat.id, "Please input your email address:");
              this.chatTrack[msg.chat.id] = 1; // prompt for email address.
            });
            break;
          case "cmd_confirm":
            this.bot.answerCallbackQuery(qry.id).then(() => {
              this.bot.sendMessage(msg.chat.id, "Please input the confirm code:");
              this.chatTrack[msg.chat.id] = 2; // prompt for confirm code.
            });
            break;
          default:
            this.bot.sendMessage(msg.chat.id, `${TG_ICONS.TIMES} Invalid command`, { parse_mode: "Markdown" });
            break;
        }
      });
      this.bot.on("message", async (msg) => {
        if (msg.text.startsWith("/subscribe") || msg.text.startsWith("/confirm") || msg.text.startsWith("/start")) {
          return;
        }
        if (msg.text.startsWith("/")) {
          this.bot.sendMessage(msg.chat.id, `${TG_ICONS.TIMES} Invalid command`, { parse_mode: "Markdown" });
          return;
        }

        // input is email address
        if (this.chatTrack[msg.chat.id] === 1) {
          const confirmCode = Buffer.from(await bcrypt.hash(`${msg.text}${msg.chat.id}`, 10)).toString("base64");

          const ret = await userModel.updateOne({ email: msg.text }, { tgChatIdDraft: `${msg.chat.id}`, tgConfirmCode: confirmCode });
          if (ret.modifiedCount > 0 || ret.nModified > 0) {
            // send email to msg.text with confirm code
            const sentEmail = await this.mailService.sendGeneralEmail(
              msg.text,
              "Telegram notification confirm code",
              `Code: ${confirmCode}\n\n1. Please click the "Confirm code" button, then input the code.\n\nor\n\n2. Please run this command:\n/confirm ${confirmCode}`
            );

            if (!sentEmail) {
              this.bot.sendMessage(msg.chat.id, `${TG_ICONS.TIMES} Invalid email address`);
              return;
            }

            this.logger.debug(JSON.stringify(ret));
            this.bot.sendMessage(msg.chat.id, `${TG_ICONS.ENEVLOPE} Check your emails and enter the confirmation code received`);
            delete this.chatTrack[msg.chat.id];
          } else {
            this.bot.sendMessage(msg.chat.id, `${TG_ICONS.STOP} Unregistered email address`);
          }
        }
        // input is confirm code
        else if (this.chatTrack[msg.chat.id] === 2) {
          const ret = await userModel.updateOne(
            { tgChatIdDraft: `${msg.chat.id}`, tgConfirmCode: msg.text },
            { tgChatId: `${msg.chat.id}`, tgConfirmCode: "confirmed" }
          );
          this.bot.sendMessage(
            msg.chat.id,
            ret.modifiedCount > 0 || ret.nModified > 0
              ? `${TG_ICONS.CONGRATS} Notifications are now set!`
              : `${TG_ICONS.TIMES} Something went wrong`
          );
          if (ret.modifiedCount > 0 || ret.nModified > 0) {
            delete this.chatTrack[msg.chat.id];
          }
        } else {
          this.bot.sendMessage(msg.chat.id, "Sorry, I cannot understand. :)");
        }
      });
      this.bot.onText(/\/subscribe (.+)/, async (msg, match) => {
        const confirmCode = Buffer.from(await bcrypt.hash(`${match[1]}${msg.chat.id}`, 10)).toString("base64");

        const ret = await userModel.updateOne({ email: match[1] }, { tgChatIdDraft: `${msg.chat.id}`, tgConfirmCode: confirmCode });
        if (ret.modifiedCount > 0 || ret.nModified > 0) {
          // send email to match[1] with confirm code
          const sentEmail = await this.mailService.sendGeneralEmail(
            match[1],
            "Telegram notification confirm code",
            `Code: ${confirmCode}\n\n1. Please click the "Confirm code" button, then input the code.\n\nor\n\n2. Please run this command:\n/confirm ${confirmCode}`
          );

          if (!sentEmail) {
            this.bot.sendMessage(msg.chat.id, `${TG_ICONS.TIMES} Invalid email address`);
            return;
          }

          this.logger.debug(JSON.stringify(ret));
          this.bot.sendMessage(msg.chat.id, `${TG_ICONS.ENEVLOPE} Check your emails and enter the confirmation code received`);
          delete this.chatTrack[msg.chat.id];
        } else {
          this.bot.sendMessage(msg.chat.id, `${TG_ICONS.STOP} Unregistered email address`);
        }
      });
      this.bot.onText(/\/confirm (.+)/, async (msg, match) => {
        const ret = await userModel.updateOne(
          { tgChatIdDraft: `${msg.chat.id}`, tgConfirmCode: match[1] },
          { tgChatId: `${msg.chat.id}`, tgConfirmCode: "confirmed" }
        );
        this.bot.sendMessage(
          msg.chat.id,
          ret.modifiedCount > 0 || ret.nModified > 0
            ? `${TG_ICONS.CONGRATS} Notifications are now set!`
            : `${TG_ICONS.TIMES} Something went wrong`
        );
        if (ret.modifiedCount > 0 || ret.nModified > 0) {
          delete this.chatTrack[msg.chat.id];
        }
      });
      // this.bot.on("polling_error", async (error) => {
      //   await this.bot.stopPolling();
      //   await this.bot.close();
      //   this.bot = null;
      //   this.logger.debug("Terminating the telegram bot...");
      // });
    }
  }

  @WebSocketServer() wsServer: sio.Server;

  afterInit() {
    this.logger.debug("WsgatewayGateway websockets initialized");
  }

  async handleConnection(client: sio.Socket, ...args: any[]) {
    this.logger.debug(`ws handleConnection for client ${client.id}}, args:${args}`);
    try {
      const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(client.request);
      // this.logger.debug(`jwt extracted ${jwt}}`);
      const payload = this.jwtService.verify<JwtPayload>(jwt);
      this.logger.debug(`ws jwt payload decoded ${JSON.stringify(payload)}`);
      const user = await this.authService.validateUser(payload.email);
      // this.logger.debug(`ws connected user ${JSON.stringify(user)}`);
      if (!user) {
        client.disconnect(true);
        this.logger.debug(`ws handleConnection client was disconnected because user was not found ${client.id}}`);
      } else {
        this.session.add(user, client);
        setTimeout(() => {
          this.welcomeUser(user, client); // (not required) welcome client for validating connection was established
        }, 5000);
      }
      this.session.getSessionStats();
    } catch (err) {
      this.logger.error(`ws handleConnection error:${err}`);
      client.disconnect(true);
      this.logger.debug(`ws handleConnection client was disconnected because of error ${client.id}}`);
    }
    // throw new WsException("fake connection error ");
  }

  handleDisconnect(client: sio.Socket) {
    this.logger.debug(`ws DISconnect client ${client.id}}`);
    this.session.remove(client);
  }

  // @SubscribeMessage("message")
  // handleMessage(client: Socket, payload: any): string {
  //   this.logger.debug(`'HELLO WS GATEWAY client:${client.id}, paylaod:${payload}`);
  //   return "Hello world!";
  // }

  @SubscribeMessage("messageFromClient")
  handleMessage(@MessageBody() data: { test: boolean }, @ConnectedSocket() client: sio.Socket): WsResponse<string> {
    this.logger.debug(`'HELLO WS GATEWAY client:${client.id}, payload: ${JSON.stringify(data)}`);
    return { event: "messageEchoFromServer", data: `hello ${client.id} from server` };
  }

  async getBotNameByBotId(botId: string) {
    const bot = await this.botModel.findOne({ _id: botId });
    this.logger.log(`Telegram notif botName: ${bot?.name || ""}`);
    return bot?.name || "";
  }

  formatDate(dateStr: any) {
    const dateObj = dateStr ? new Date(dateStr) : new Date();
    return dateObj.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZoneName: "short",
    });
  }

  getErrorMessage(error: string): string {
    let errorMessage = "";
    if (error) {
      const errorMessagePatterns = ["msg=", 'message="', '"msg":"', "message="];

      let indicator: number;
      for (let i = 0; i < errorMessagePatterns.length; i += 1) {
        indicator = error.indexOf(errorMessagePatterns[i]);
        if (indicator > -1) {
          errorMessage = error.substring(indicator + errorMessagePatterns[i].length);
          indicator = errorMessage.indexOf('"');
          errorMessage = errorMessage.substring(0, indicator > -1 ? indicator : errorMessage.length);
          break;
        }
      }

      if (errorMessage.trim() === "") {
        errorMessage = error;
      }
    }
    return errorMessage;
  }

  async notifyUser(payload: OrderEventPayload) {
    // this.logger.debug(`notifyUser: user :${payload.userId}`);
    const sockets = this.session.findUserSockets(payload.userId);
    if (sockets && sockets.length > 0) {
      this.logger.debug(`notifyUser: user :${payload.userId} will be notified on ${sockets.length} sockets`);
      for (const client of sockets) {
        // this.logger.debug(`notifyUser: emit on socket ${client.id} user :${payload.userId}`);
        client.emit("ws_order_event", payload);
      }
    } else {
      this.logger.debug(`notifyUser: IGNORED, user :${payload.userId} does not seem to have a connected socket`);
    }
    const tgBot: TelegramBot = this.bot;
    const user = await this.userModel.findOne({ _id: payload.userId });
    if (
      user &&
      user.tgChatId &&
      tgBot &&
      payload.side &&
      payload.status &&
      ["BUY", "SELL"].includes(payload.side.toUpperCase()) &&
      ["FILLED", "FAILED", "ERROR"].includes(payload.status.toUpperCase())
    ) {
      this.logger.log(`Telegram notif payload: ${JSON.stringify(payload)}`);
      const nowDateTime = this.formatDate(null);

      const errorMessage = this.getErrorMessage(payload.error);

      // get extra info for buy/sell activity
      const buyOrderInfo = {
        updatedAt: null,
        side: "",
        profitPercentage: 0,
        realisedGain: 0,
        paidAmount: 0,
        remainedAmount: 0,
        perfeesRate: 0,
      };
      const sellOrderInfo = {
        updatedAt: null,
        side: "",
        profitPercentage: 0,
        realisedGain: 0,
        paidAmount: 0,
        remainedAmount: 0,
        perfeesRate: 0,
      };
      let botName = "";
      if (payload.initiator === "algobot") {
        if (payload.side && payload.side.toUpperCase() === "SELL" && payload.status.toUpperCase() === "FILLED") {
          // get sell record
          const sellOrder = await this.orderTrackingModel.findOne({
            _id: payload.orderTrack,
          });
          this.logger.log(`Telegram notif sellOrder: ${JSON.stringify(sellOrder)}`);
          if (sellOrder) {
            if (sellOrder.ctxBot === "open") {
              sellOrderInfo.side = "Opened";
            } else if (sellOrder.ctxBot === "close") {
              sellOrderInfo.side = "Closed";
            }
            // get bot name from sellOrder[0].botId field
            botName = await this.getBotNameByBotId(sellOrder.botId);
            const cycleInfo = await this.performanceCyclesModel.findOne({
              userId: payload.userId,
              // botId: sellOrder.botId, // BUGFIX: in the perf cycles model, botId field is missing sometimes
              subBotId: sellOrder.botSubId,
              cycleSequence: sellOrder.cycleSequence,
            });
            this.logger.log(`Telegram notif cycleInfo: ${JSON.stringify(cycleInfo)}`);
            if (sellOrder.ctxBot !== "open" && cycleInfo) {
              // if not SHORT, perfees would show
              sellOrderInfo.profitPercentage = cycleInfo.profitPercentage || 0;
              sellOrderInfo.realisedGain = cycleInfo.realisedGain?.ubxt || 0;
              if (cycleInfo.performanceFee) {
                sellOrderInfo.paidAmount = cycleInfo.performanceFee.paidAmount || 0;
                sellOrderInfo.remainedAmount = cycleInfo.performanceFee.remainedAmount || 0;
              } else {
                const feeTrack = await this.FeeTrackingModel.findOne({
                  performanceCycleId: cycleInfo.id,
                });
                if (feeTrack) {
                  sellOrderInfo.paidAmount = feeTrack.amount || 0;
                }
                // const botWallet = await this.BotWalletModel.findOne({
                //   userId: payload.userId,
                //   botId: sellOrder.botId,
                // });
                // if (botWallet) {
                //   sellOrderInfo.remainedAmount = botWallet.amount - sellOrderInfo.paidAmount;
                // }
              }
              sellOrderInfo.perfeesRate =
                sellOrderInfo.realisedGain === 0 ? 0 : (100 * sellOrderInfo.paidAmount) / sellOrderInfo.realisedGain;
            }
            if (sellOrderInfo.profitPercentage === 0) {
              const orders = await this.orderTrackingModel.find({
                botSubId: sellOrder.botSubId,
                completed: true,
                cycleSequence: sellOrder.cycleSequence,
              });
              let entryValue = 0;
              let closeValue = 0;
              if (orders.length > 1) {
                // should be at least 2 orders - open and close.
                for (const o of orders) {
                  if (!o.completion) {
                    break;
                  }
                  if (o.ctxBot === "open") {
                    entryValue = o.completion.pExec * o.completion.qExec;
                  }
                  if (o.ctxBot === "close") {
                    closeValue = o.completion.pExec * o.completion.qExec;
                  }
                }
                if (entryValue > 0) {
                  sellOrderInfo.profitPercentage = (100 * (closeValue - entryValue)) / entryValue;
                }
              }
            }
            sellOrderInfo.updatedAt = this.formatDate(sellOrder.updated_at || sellOrder.created_at);
          }
        } else if (payload.side && payload.side.toUpperCase() === "BUY" && payload.status.toUpperCase() === "FILLED") {
          // get buy record
          const buyOrder = await this.orderTrackingModel.findOne({
            _id: payload.orderTrack,
          });
          this.logger.log(`Telegram notif buyOrder: ${JSON.stringify(buyOrder)}`);
          if (buyOrder) {
            if (buyOrder.ctxBot === "open") {
              buyOrderInfo.side = "Opened";
            } else if (buyOrder.ctxBot === "close") {
              buyOrderInfo.side = "Closed";
            }
            botName = await this.getBotNameByBotId(buyOrder.botId);
            const cycleInfo = await this.performanceCyclesModel.findOne({
              userId: payload.userId,
              // botId: buyOrder.botId, // BUGFIX: in the perf cycles model, botId field is missing sometimes
              subBotId: buyOrder.botSubId,
              cycleSequence: buyOrder.cycleSequence,
            });
            if (buyOrder.ctxBot !== "open" && cycleInfo) {
              // if not SHORT, perfees would show
              buyOrderInfo.profitPercentage = cycleInfo.profitPercentage || 0;
              buyOrderInfo.realisedGain = cycleInfo.realisedGain?.ubxt || 0;
              if (cycleInfo.performanceFee) {
                buyOrderInfo.paidAmount = cycleInfo.performanceFee.paidAmount || 0;
                buyOrderInfo.remainedAmount = cycleInfo.performanceFee.remainedAmount || 0;
              } else {
                const feeTrack = await this.FeeTrackingModel.findOne({
                  performanceCycleId: cycleInfo.id,
                });
                if (feeTrack) {
                  buyOrderInfo.paidAmount = feeTrack.amount || 0;
                }
                // const botWallet = await this.BotWalletModel.findOne({
                //   userId: payload.userId,
                //   botId: buyOrder.botId,
                // });
                // if (botWallet) {
                //   buyOrderInfo.remainedAmount = botWallet.amount - buyOrderInfo.paidAmount;
                // }
              }
              buyOrderInfo.perfeesRate = buyOrderInfo.realisedGain === 0 ? 0 : (100 * buyOrderInfo.paidAmount) / buyOrderInfo.realisedGain;
            }
            if (buyOrderInfo.profitPercentage === 0) {
              const orders = await this.orderTrackingModel.find({
                botSubId: buyOrder.botSubId,
                completed: true,
                cycleSequence: buyOrder.cycleSequence,
              });
              let entryValue = 0;
              let closeValue = 0;
              if (orders.length > 1) {
                // should be at least 2 orders - open and close.
                for (const o of orders) {
                  if (!o.completion) {
                    break;
                  }
                  if (o.ctxBot === "open") {
                    entryValue = o.completion.pExec * o.completion.qExec;
                  }
                  if (o.ctxBot === "close") {
                    closeValue = o.completion.pExec * o.completion.qExec;
                  }
                }
                if (entryValue > 0) {
                  buyOrderInfo.profitPercentage = (100 * (closeValue - entryValue)) / entryValue;
                }
              }
            }
            buyOrderInfo.updatedAt = this.formatDate(buyOrder.updated_at || buyOrder.created_at);
          }
        }
      }

      let messageBody = "";
      if (payload.initiator === "algobot") {
        messageBody = `
${TG_ICONS.GRAPH} ${botName.toUpperCase()} | ${
          payload.status.toUpperCase() === "FAILED" || payload.status.toUpperCase() === "ERROR" ? TG_ICONS.TIMES : TG_ICONS.CHECK
        } ${payload.side ? payload.side.toUpperCase() : ""} _${payload.sbl.toUpperCase()}_
${TG_ICONS.SEPARATOR}
${
  payload.error && (payload.status.toUpperCase() === "FAILED" || payload.status.toUpperCase() === "ERROR")
    ? `${TG_ICONS.EXCLAMATION} *Error: ${errorMessage}* ${TG_ICONS.HYPHEN} _${nowDateTime}_
`
    : `${
        payload.side && payload.side.toUpperCase() === "SELL"
          ? `${TG_ICONS.ROCKET} *Position ${sellOrderInfo.side}* ${TG_ICONS.HYPHEN} _${sellOrderInfo.updatedAt}_
${
  sellOrderInfo.side === "Closed"
    ? `*Profit trade:* _${sellOrderInfo.profitPercentage > 0 ? "+" : ""}${sellOrderInfo.profitPercentage.toFixed(2)}%_
${
  sellOrderInfo.perfeesRate || sellOrderInfo.paidAmount
    ? `*Perf Fees rate:* _${sellOrderInfo.perfeesRate.toFixed(2)}%_ | *Perf Fees due:* _${sellOrderInfo.paidAmount.toFixed(2)} UBXT_
`
    : ""
}`
    : ""
}*Quantity executed:* _${Number(payload.qExec).toFixed(6)}_
*Price executed:* _${Number(payload.pExec).toFixed(2)}_
*Total:* _${Number(payload.cumulQuoteCost).toFixed(2)}_
${TG_ICONS.SEPARATOR}
${TG_ICONS.GRAPH} *Sell order placed at MarketPrice* ${TG_ICONS.HYPHEN} _${sellOrderInfo.updatedAt}_
*Exchange:* _${payload.exch ? payload.exch.toUpperCase() : ""}_
*Quantity Asked:* _${Number(payload.qExec).toFixed(6)}_
${TG_ICONS.SEPARATOR}
${TG_ICONS.BELL} *Sell Signal Received* ${TG_ICONS.HYPHEN} _${sellOrderInfo.updatedAt}_
`
          : ""
      }${
        payload.side && payload.side.toUpperCase() === "BUY"
          ? `${TG_ICONS.ROCKET} *Position ${buyOrderInfo.side}* ${TG_ICONS.HYPHEN} _${buyOrderInfo.updatedAt}_
${
  buyOrderInfo.side === "Closed"
    ? `*Profit trade:* _${buyOrderInfo.profitPercentage > 0 ? "+" : ""}${buyOrderInfo.profitPercentage.toFixed(2)}%_
${
  buyOrderInfo.perfeesRate || buyOrderInfo.paidAmount
    ? `*Perf Fees rate:* _${buyOrderInfo.perfeesRate.toFixed(2)}%_ | *Perf Fees due:* _${buyOrderInfo.paidAmount.toFixed(2)} UBXT_
`
    : ""
}`
    : ""
}*Quantity executed:* _${Number(payload.qExec).toFixed(6)}_
*Price executed:* _${Number(payload.pExec).toFixed(2)}_
*Total:* _${Number(payload.cumulQuoteCost).toFixed(2)}_
${TG_ICONS.SEPARATOR}
${TG_ICONS.GRAPH} *Buy order placed at MarketPrice* ${TG_ICONS.HYPHEN} _${buyOrderInfo.updatedAt}_
*Exchange:* _${payload.exch ? payload.exch.toUpperCase() : ""}_
*Pair:* _${payload.sbl ? payload.sbl.toUpperCase() : ""}_
*Quantity Asked:* _${Number(payload.qExec).toFixed(6)}_
${TG_ICONS.SEPARATOR}
${TG_ICONS.BELL} *Buy Signal Received* ${TG_ICONS.HYPHEN} _${buyOrderInfo.updatedAt}_
`
          : ""
      }
`
}
        `;
      } else if (payload.initiator === "direct" && payload.side.toUpperCase() === "BUY" && errorMessage.includes("Order does not exist")) {
        const buyOrder = await this.orderTrackingModel.findOne({
          _id: payload.orderTrack,
        });
        messageBody = `
${TG_ICONS.GRAPH} Manual Trade | ${TG_ICONS.CHECK} ${payload.side ? payload.side.toUpperCase() : ""} _${payload.sbl.toUpperCase()}_
${TG_ICONS.SEPARATOR}
*Status:* _NEW_
*Quantity asked:* _${Number(buyOrder?.qtyBaseAsked ?? 0).toFixed(6)}_
*Price asked:* _${Number(buyOrder?.priceAsked ?? 0).toFixed(2)}_
${TG_ICONS.SEPARATOR}
${TG_ICONS.ROCKET} *Buy order placed at MarketPrice* ${TG_ICONS.HYPHEN} _${nowDateTime}_
*Exchange:* _${payload.exch ? payload.exch.toUpperCase() : ""}_
*Pair:* _${payload.sbl.toUpperCase()}_
        `;
      } else {
        messageBody = `
${TG_ICONS.GRAPH} Manual Trade | ${
          payload.status.toUpperCase() === "FAILED" || payload.status.toUpperCase() === "ERROR" ? TG_ICONS.TIMES : TG_ICONS.CHECK
        } ${payload.side ? payload.side.toUpperCase() : ""} _${payload.sbl.toUpperCase()}_
${TG_ICONS.SEPARATOR}
${
  payload.error && (payload.status.toUpperCase() === "FAILED" || payload.status.toUpperCase() === "ERROR")
    ? `${TG_ICONS.EXCLAMATION} *Error: ${errorMessage}* ${TG_ICONS.HYPHEN} _${nowDateTime}_
`
    : `${
        payload.side && payload.side.toUpperCase() === "SELL"
          ? `*Quantity executed:* _${Number(payload.qExec).toFixed(6)}_
*Status:* _${payload.status.toUpperCase()}_
*Price executed:* _${Number(payload.pExec).toFixed(2)}_
*Total:* _${Number(payload.cumulQuoteCost).toFixed(2)}_
${TG_ICONS.SEPARATOR}
${TG_ICONS.GRAPH} *Sell order placed at MarketPrice* ${TG_ICONS.HYPHEN} _${nowDateTime}_
*Exchange:* _${payload.exch ? payload.exch.toUpperCase() : ""}_
*Quantity Asked:* _${Number(payload.qExec).toFixed(6)}_
`
          : ""
      }${
        payload.side && payload.side.toUpperCase() === "BUY"
          ? `*Quantity executed:* _${Number(payload.qExec).toFixed(6)}_
*Status:* _${payload.status.toUpperCase()}_
*Price executed:* _${Number(payload.pExec).toFixed(2)}_
*Total:* _${Number(payload.cumulQuoteCost).toFixed(2)}_
${TG_ICONS.SEPARATOR}
${TG_ICONS.GRAPH} *Buy order placed at MarketPrice* ${TG_ICONS.HYPHEN} _${nowDateTime}_
*Exchange:* _${payload.exch ? payload.exch.toUpperCase() : ""}_
*Pair:* _${payload.sbl.toUpperCase()}_
*Quantity Asked:* _${Number(payload.qExec).toFixed(6)}_
`
          : ""
      }
`
}
        `;
      }
      // tgBot.sendMessage(user.tgChatId, `ORDER_EVENT: ${JSON.stringify(payload, null, 2)}`);
      tgBot.sendMessage(user.tgChatId, messageBody, { parse_mode: "Markdown" });
    }
    // this.logger.log(`notifyUser end`);
  }

  notifyEventToUser(userId: string, eventName: string, payload: any) {
    // this.logger.debug(`notifyPfsDepositEventToUser: ${notify}`);
    const sockets = this.session.findUserSockets(userId);
    if (sockets && sockets.length > 0) {
      for (const client of sockets) {
        client.emit(eventName, payload);
      }
    } else {
      this.logger.debug(`websocket-notify-${eventName}: IGNORED - ${userId}`);
    }
    const tgBot: TelegramBot = this.bot;
    this.userModel.findOne({ _id: userId }, function (err, res) {
      if (err || !res) {
        // error!
      } else if (res.tgChatId && tgBot) {
        // tgBot.sendMessage(res.tgChatId, `${eventName}: ${JSON.stringify(payload, null, 2)}`);
      }
    });
  }

  notifyPerformanceCyclesEventToUser(userId: string) {
    // this.notifyEventToUser(userId, "ws_performance_cycles_event", {});
    this.notifyEventToUser(userId, "ws_perfees_event", {});
  }

  notifyPerfeesEventToUser(userId: string, eventType: string, message: any) {
    this.notifyEventToUser(userId, "ws_perfees_event", { eventType, message });
  }

  welcomeUser(user: UserIdentity, client: sio.Socket) {
    if (client) {
      this.logger.log(`welcomeUser will emit for ${client.id}`);

      // if (user.tgChatId && this.bot) {
      //   this.bot.sendMessage(
      //     user.tgChatId, // "1893335643", // '959414547',
      //     `\ud83d\udc64 ${user.email} logged in`
      //   );
      // }

      client.emit("ws_welcome", { text: "hello user", now: new Date() });
    }
  }
}
