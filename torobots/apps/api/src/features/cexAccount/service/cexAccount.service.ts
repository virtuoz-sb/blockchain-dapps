import { Injectable, NotFoundException } from '@nestjs/common';
const coinbase = require("coinbase");
const ccxt = require("ccxt");
import { UpdateQuery } from 'mongoose';
import { remove } from '../../../shared/utils/remove';
import { CexAccountDto } from '../dto/cexAccount.dto';
import { ECEXType, IStoredUser } from "@torobot/shared";
import { mongoDB, IUserDocument, ICexAccountDocument, cexAccountUnpopulatedFields } from "@torobot/shared";

@Injectable()
export class CexAccountService {
  constructor() { }
  async create(account: CexAccountDto, user: IUserDocument) {
    const object = await mongoDB.CexAccounts.create({ ...account, owner: user._id });
    return this.getById(object._id);
  }

  async update(account: ICexAccountDocument, body: UpdateQuery<ICexAccountDocument>, user: IUserDocument) {
    await mongoDB.CexAccounts.findOneAndUpdate({ _id: account._id, owner: user._id }, body);
    return this.getById(account._id);
  }

  delete(account: ICexAccountDocument, user: IUserDocument) {
    const owner = account.owner as IStoredUser;
    if (String(owner._id) === String(user._id)) {
      return mongoDB.CexAccounts.findByIdAndDelete({ _id: account._id, owner: user._id });
    } else {
      remove(account.users, (wuser: any) => wuser._id === user._id);
      return account.save();
    }
  }

  async getById(accountId: string) {
    const query = mongoDB.CexAccounts.findById(accountId).select(cexAccountUnpopulatedFields);
    const doc = await mongoDB.CexAccounts.populateModel(query);
    return doc as ICexAccountDocument;
  }

  async getAccounts(accountId: string) {
    const query = mongoDB.CexAccounts.findById(accountId);
    const doc = await mongoDB.CexAccounts.populateModel(query);
    const d = doc as ICexAccountDocument;
    if (d.cex === ECEXType.COINBASE) {
      const coinbaseClient = new coinbase.Client({
        'apiKey': d.apiKey,
        'apiSecret': d.apiSecret,
        'strictSSL': false
      });
      return new Promise((resolve, reject) => {
        coinbaseClient.getAccounts({}, (err, accounts) => {
          if (err) {
            resolve(null);
          } else {
            resolve(accounts);
          }
        });  
      })
    } else if (d.cex === ECEXType.KUCOIN) {
      const kucoin = new ccxt.kucoin({
        apiKey: d.apiKey,
        secret: d.apiSecret,
        password: d.apiPassword
      });
      const balance = await kucoin.fetchFreeBalance();
      return balance;
    }
  }

  async validate(accountId: string) {
    const account = await this.getById(accountId);

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async getAll() {
    const query = mongoDB.CexAccounts.find().select(cexAccountUnpopulatedFields);
    return mongoDB.CexAccounts.populateModel(query);
  }

  getOwnerWallets(user: IUserDocument) {
    const query = mongoDB.CexAccounts.find({ owner: user._id }).select(cexAccountUnpopulatedFields);
    return mongoDB.CexAccounts.populateModel(query);
  }

  async getUserWallets(user: IUserDocument) {
    const query = mongoDB.CexAccounts.find({ $or: [{ owner: user._id }, { users: { $in: user._id } }] }).select(cexAccountUnpopulatedFields);
    return mongoDB.CexAccounts.populateModel(query);
  }

}