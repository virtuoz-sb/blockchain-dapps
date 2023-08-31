/* eslint-disable */
import { Injectable } from "@nestjs/common";

import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Transaction } from "../dbmodels/transaction";

@Injectable()
export default class TransactionsRepository {
  constructor(
    @InjectModel("Transaction")
    private transactionModel: Model<Transaction>
  ) {}

  async findAll(sortOrder?: string, pageNumber?: number, pageSize?: number): Promise<Transaction[]> {
    // console.log("searching for transactions ", sortOrder, pageNumber, pageSize);

    // return this.transactionModel.find();

    return this.transactionModel.find({}, null, {
      // pagination
      skip: pageNumber * pageSize, // to determine the beginning of our resultset
      limit: pageSize,
      sort: {
        seqNo: sortOrder, // sort on seqNO following the specified sortOrder
      },
    });
  }

  async findTransactionById(transactionId: string): Promise<Transaction> {
    return this.transactionModel.findOne({ _id: transactionId });
  }

  async findTransactionByTxnId(txnId: string): Promise<Transaction> {
    return this.transactionModel.findOne({ txn_id: txnId });
  }

  async findTransactionsEmail(email: string): Promise<Transaction[]> {
    return this.transactionModel.find({ buyer_email: email }, null, {
      sort: {
        logtime: "desc", // last one for the user
      },
    });
  }

  async findExecutedTransactionsEmail(email: string): Promise<Transaction[]> {
    return this.transactionModel.find({ buyer_email: email, status: "EXECUTED" }, null, {
      sort: {
        logtime: "desc", // last one for the user
      },
    });
  }

  async findExecutedTransactionsSubscriptionId(subscriptionId: string): Promise<Transaction[]> {
    return this.transactionModel.find({ custom: subscriptionId, status: "EXECUTED" }, null, {
      sort: {
        logtime: "asc", // first one for the subscription for this user
      },
    });
  }

  async updateTransaction(transactionId: string, changes: Partial<Transaction>): Promise<Transaction> {
    return this.transactionModel.findByIdAndUpdate({ _id: transactionId }, changes, { new: true }); // to receive back a new version of the transaction
  }

  async deleteTransaction(transactionId: string) {
    return this.transactionModel.deleteOne({ _id: transactionId });
  }

  async addTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
    const newTransaction = new this.transactionModel(transaction); // memory style
    await newTransaction.save();
    return newTransaction.toObject({ versionKey: false }); // serialization case -> version
  }
}
