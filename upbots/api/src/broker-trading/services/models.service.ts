/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable new-cap */

import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as referralCodeGenerator from "referral-code-generator";

import { User, UserDto, UserIdentity } from "../../types/user";
import { ExchangeKeyCreationDto, ExchangeKey, ExchangeKeyDto, ExchangeKeyEditDto } from "../../types/exchange-key";

import * as Owner from "../models/owner.model";
import * as Trader from "../models/trader.model";

import HuobiproProxy from "./huobipro-proxy";

import CipherService from "../../shared/encryption.service";

@Injectable()
export default class ModelsService {
  private readonly logger = new Logger(ModelsService.name);

  constructor(
    @InjectModel("User") private userModel: Model<User>,
    @InjectModel("ExchangeKey") private keyModel: Model<ExchangeKey>,
    @InjectModel(Owner.ModelName) private OwnerModel: Model<Owner.Model>,
    @InjectModel(Trader.ModelName) private TraderModel: Model<Trader.Model>,
    private config: ConfigService,
    private cipherService: CipherService,
    private readonly huobiproProxy: HuobiproProxy
  ) {}

  onModuleInit() {}

  async getUserById(userId: string) {
    return this.userModel.findById(userId);
  }

  async getOwners(payload: any, populate?: boolean) {
    const conditions = {};
    let owners = [];
    if (populate) {
      owners = await this.OwnerModel.find(conditions).populate("userId").populate("exchKeyId");
      owners = owners.map((owner) => {
        if (owner.exchKeyId?.secretKey) {
          owner.exchKeyId.secretKey = this.decryptKey(owner.exchKeyId.secretKey);
        }
        return owner;
      });
    } else {
      owners = await this.OwnerModel.find(conditions);
    }
    return owners;
  }

  async upsertOwner(payload: any) {
    if (payload.ownerId) {
      // update
      const result = await this.OwnerModel.update({ _id: payload.ownerId }, payload.data);
      return result;
    }
    // insert
    let result = new this.OwnerModel(payload.data);
    result = await result.save();
    return result;
  }

  async deleteOwner(payload: any) {
    const result = await this.OwnerModel.findOneAndDelete({ _id: payload.ownerId });
    return result;
  }

  async getTraders(payload: any, populate?: boolean) {
    let conditions = {};
    if (payload.traderIds && payload.traderIds.length > 0) {
      conditions = { ...conditions, _id: { $in: payload.traderIds } };
    }

    let traders = [];
    if (populate) {
      traders = await this.TraderModel.find(conditions).populate("userId").populate("exchKeyId");
      traders = traders.map((trader) => {
        if (trader.exchKeyId?.secretKey) {
          trader.exchKeyId.secretKey = this.decryptKey(trader.exchKeyId.secretKey);
        }
        return trader;
      });
    } else {
      traders = await this.TraderModel.find(conditions);
    }
    return traders;
  }

  async getTrader(userId: string, populate?: boolean) {
    const condition = {
      userId,
    };

    let trader = null;
    if (populate) {
      trader = await this.TraderModel.findOne(condition).populate("userId").populate("exchKeyId");
    } else {
      trader = await this.TraderModel.findOne(condition);
    }
    return trader;
  }

  async createTrader(userId: string) {
    const owners: any[] = await this.getOwners({}, true);
    if (!owners || owners.length === 0) {
      this.logger.debug("***---brokerTrading-models: there is no owners");
      return null;
    }
    const owner = owners[0];
    let trader: any = await this.getTrader(userId);
    if (trader) {
      return trader;
    }

    // get owner exchange proxy
    const ownerExchKey = {
      apiKey: owner?.exchKeyId.publicKey,
      secret: this.decryptKey(owner?.exchKeyId.secretKey),
    };
    this.huobiproProxy.setAccount(ownerExchKey);

    // create sub account for this user
    const subAccountName = `upbots${referralCodeGenerator.alphaNumeric("uppercase", 4, 1)}`;
    const subAccountUid = await this.huobiproProxy.createSubAccount(subAccountName, "");
    if (!subAccountUid) {
      this.logger.debug("***---brokerTrading-models: subAccountUid create error");
      return null;
    }

    // create sub account api key for this user
    const subAccountApiKey = await this.huobiproProxy.createSubAccountApiKey(subAccountUid, "trading");
    if (!subAccountApiKey) {
      this.logger.debug("***---brokerTrading-models: subAccountApiKey create error");
      return null;
    }

    // create exchange
    const exchangeId = await this.createExchange(
      userId,
      `huobi-broker-${subAccountName}`,
      subAccountName,
      subAccountApiKey.accessKey,
      subAccountApiKey.secretKey
    );

    if (!exchangeId) {
      this.logger.debug("***---brokerTrading-models: exchangeId creation failed");
      return null;
    }

    // create trader model
    trader = new this.TraderModel({
      userId,
      ownerExchKeyId: owner?.exchKeyId?._id,
      exchKeyId: exchangeId,
      subAccount: {
        uid: subAccountUid,
        name: subAccountName,
        publicKey: subAccountApiKey.accessKey,
        secretKey: this.encryptKey(subAccountApiKey.secretKey),
      },
    });

    trader = await trader.save();
    return trader;
  }

  async getTraderDepositAddress(userId: string, network: string, currency: string) {
    const trader = await this.getTrader(userId);
    if (!trader) {
      return null;
    }

    // get trader exchange proxy
    const traderExchKey = {
      apiKey: trader.subAccount.publicKey,
      secret: this.decryptKey(trader.subAccount.secretKey),
    };
    this.huobiproProxy.setAccount(traderExchKey);
    const depositAddress = await this.huobiproProxy.getDepositAddress(network, currency);
    if (!depositAddress) {
      return null;
    }

    return {
      address: depositAddress,
    };
  }

  async getBalance(userId: string, type: string) {
    const trader = await this.getTrader(userId);
    if (!trader) {
      return null;
    }

    // get trader exchange proxy
    const traderExchKey = {
      apiKey: trader.subAccount.publicKey,
      secret: this.decryptKey(trader.subAccount.secretKey),
    };
    this.huobiproProxy.setAccount(traderExchKey);
    const balance = await this.huobiproProxy.getBalance(type);
    return balance;
  }

  async getTransactions(userId: string) {
    const trader = await this.getTrader(userId);
    if (!trader) {
      return null;
    }

    // get trader exchange proxy
    const traderExchKey = {
      apiKey: trader.subAccount.publicKey,
      secret: this.decryptKey(trader.subAccount.secretKey),
    };
    this.huobiproProxy.setAccount(traderExchKey);
    const transactions = await this.huobiproProxy.getTransactions();
    return transactions;
  }

  async createExchange(userId: string, name: string, subAccountName: string, publicKey: string, secretKey: string) {
    try {
      const now = new Date();
      const exchange = "huobi";
      const type = "spot";
      // const service = "huobi-broker-user";
      const quoteCurrency = "USDT";
      const newKey = new this.keyModel({
        userId,
        name,
        exchange,
        type,
        // service,
        quoteCurrency,
        publicKey,
        secretKey: this.encryptKey(secretKey),
        password: "",
        subAccountName,
        created: now,
        updated: now,
      });
      const key = await newKey.save();
      return key._id;
    } catch (e) {
      console.log('("***---brokerTrading-models@ createExchange-issue:', e.message);
      return null;
    }
  }

  async deleteExchange(userId: string) {
    const trader = await this.getTrader(userId);
    if (!trader || !trader.exchKeyId) {
      return null;
    }

    try {
      await this.keyModel.deleteOne({ _id: trader.exchKeyId });
      trader.exchKeyId = null;
      await trader.save();
      return trader;
    } catch (e) {
      return null;
    }
  }

  async withdraw(userId: string, data: Trader.WithdrawDto) {
    const trader = await this.getTrader(userId);
    if (!trader || !trader.exchKeyId) {
      return null;
    }

    try {
      // await this.keyModel.deleteOne({_id: trader.exchKeyId});
      // trader.exchKeyId = null;
      // await trader.save();
      // return trader;
      return null;
    } catch (e) {
      return null;
    }
  }

  encryptKey(secretKey: string) {
    const encKey = this.config.get<string>("KEYSTORE_ENCK");
    const authKey = this.config.get<string>("KEYSTORE_AUTHK");

    const encrypted = this.cipherService.encryptWithHmac(secretKey, encKey, authKey);
    return encrypted;
  }

  decryptKey(secretKey: string) {
    const encKey = this.config.get<string>("KEYSTORE_ENCK");
    const authKey = this.config.get<string>("KEYSTORE_AUTHK");

    const decrypted = this.cipherService.decryptWithHmac(secretKey, encKey, authKey);
    return decrypted;
  }
}
