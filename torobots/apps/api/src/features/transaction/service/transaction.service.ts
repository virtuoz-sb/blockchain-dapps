import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateQuery } from 'mongoose';
import { remove } from '../../../shared/utils/remove';
import { TransactionDto } from '../dto/transaction.dto';
import { mongoDB, IUserDocument, ITransactionDocument, ETradingInitiator } from "@torobot/shared";
import * as _ from "lodash";

@Injectable()
export class TransactionService {
  constructor() {}
  async create(transaction: TransactionDto) {
    const object = await mongoDB.Transactions.create(transaction);
    return this.getById(object._id);    
  }

  async update(transaction: ITransactionDocument, update: UpdateQuery<ITransactionDocument>) {
    await mongoDB.Transactions.findOneAndUpdate({ _id: transaction._id }, update);
    return this.getById(transaction._id);
  }

  delete(transaction: ITransactionDocument) {
    return mongoDB.Transactions.findOneAndDelete({ _id: transaction._id });
  }

  async getById(transactionId: string) {
    const query = mongoDB.Transactions.findById(transactionId);
    const doc = await mongoDB.Transactions.populateModel(query);
    return doc as ITransactionDocument;
  }

  async validate(transactionId: string) {
    const transaction = await this.getById(transactionId);

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  async getAll() {
    const query = mongoDB.Transactions.find().sort({created: -1});
    return mongoDB.Transactions.populateModel(query);
  }

  async getsByBotId(bot: string) {
    const query = mongoDB.Transactions.find({
      bot,
      initiator: ETradingInitiator.BOT
    });
    return mongoDB.Transactions.populateModel(query);
  }

  async getsByAutoBotId(bot: string) {
    const query = mongoDB.Transactions.find({
      bot,
      initiator: ETradingInitiator.AUTO
    });
    return mongoDB.Transactions.populateModel(query);
  }

  async getHistory() {
    const transactions = await this.getAll();
    const group = _.groupBy(transactions, 'bot._id');
    var result = _.values(
      _.mapValues(
      group, txlist => ({
        _id: txlist[0]._id,
        user: txlist[0].user,
        wallet: txlist[0].wallet,
        blockchain: txlist[0].blockchain,
        node: txlist[0].node,
        dex: txlist[0].dex,
        bot: txlist[0].bot,
        coin: txlist[0].coin,
        token: txlist[0].token,
        initiator: txlist[0].initiator,
        transactions: txlist.map(tx => _.omit(tx.toObject(), ['user', 'wallet', 'blockchain', 'dex', 'bot', 'coin', 'token', 'initiator'])),
        created: txlist[0].created
      })
    ));
    return result;
  }
}