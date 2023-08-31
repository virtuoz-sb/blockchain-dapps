/* eslint-disable */
import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Req,
  Res,
  Delete,
  Post,
  HttpException,
  BadRequestException,
  UseFilters,
  ParseIntPipe,
  NotFoundException,
  UseGuards,
  Query,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import TransactionsRepository from "../repositories/transactions.repository";
import { Transaction } from "../dbmodels/transaction";
import SubscriptionsRepository from "../repositories/subscriptions.repository";
import Subscription from "../dbmodels/subscription";
import SellerGuard from "../../shared/seller.guard";

class UserSubscription {
  buyer_email: string;

  expired: boolean;

  paid: boolean;

  subscription: Subscription;

  startdate: string;

  ellapsedmonths: number;

  executed_payments: number;

  message: string;

  id: string;

  transactions: Transaction[];
}

/*
 * COINPAYMENTS CONFIG AND INIT
 */
const coinpayments = require("coinpayments");

interface paymentclientCreateTransactionResponse {
  amount: number;
  txn_id: string;
  address: string;
  confirms_needed: string;
  timeout: number;
  checkout_url: string;
  status_url: string;
  qrcode_url: string;
}

interface paymentclientGetTxInfoResponse {
  time_created: number;
  time_expires: number;
  status: number;
  status_text: string;
  type: string;
  coin: string;
  amount: number;
  amountf: number;
  received: number;
  receivedf: number;
  recv_confirms: number;
  payment_address: string;
  checkout: string;
  shipping: string;
}

@ApiTags("transactions")
@Controller("transactions") // /api(from main ts global prefix)/transactions
export default class TransactionsController {
  paymentClient: any;

  constructor(
    private transactionsDB: TransactionsRepository,
    private subscriptionsDB: SubscriptionsRepository,
    private config: ConfigService
  ) {
    const CoinpaymentsCredentials = {
      key: this.config.get<string>("NESTJS_API_CP_KEY"),
      secret: this.config.get<string>("NESTJS_API_CP_SECRET"),
    };
    this.paymentClient = new coinpayments(CoinpaymentsCredentials);
  }

  @ApiOperation({
    summary: "create a twin transaction for a subscription linked to a customer",
    description: `create a transaction in our history document store and a transaction at the coinpayment level for a customer related to a new or existing subscription`,
  })
  @Post()
  @UseGuards(AuthGuard("jwt"), SellerGuard)
  async createTransaction(
    @Body() transaction: Partial<Transaction> // no partial with the global pipe validator
  ): Promise<Transaction> {
    console.log("creating new transaction");
    console.log("COINPAYMENTS");

    // to replace with the transaction object here below
    // add user id ?

    transaction.logtime = new Date().toLocaleString();

    if (transaction.amount > 0) {
      // FREE TRIAL DOESN'T HAVE TO CALL COINPAYMENT

      const CoinpaymentsCreateTransactionOpts = {
        currency1: transaction.currency1,
        currency2: transaction.currency2,
        amount: transaction.amount,
        buyer_email: transaction.buyer_email,
        address: transaction.address,
        buyer_name: transaction.buyer_name,
        item_name: transaction.item_name,
        item_number: transaction.item_number,
        invoice: transaction.invoice,
        custom: transaction.custom,
        ipn_url: transaction.ipn_url,
        success_url: transaction.success_url,
        cancel_url: transaction.cancel_url,
      };

      try {
        const resultObj = await this.paymentClient.createTransaction(CoinpaymentsCreateTransactionOpts);
        if (!resultObj) {
          console.log("Coinpayments createTransaction failed");
          throw new Error("failed");
        } else {
          console.log(resultObj);
          console.log("RETRIEVE INFO FROM COINPAYMENTS");
          const paymentclientResponse: paymentclientCreateTransactionResponse = <paymentclientCreateTransactionResponse>resultObj;
          console.log(paymentclientResponse);
          transaction.txn_id = paymentclientResponse.txn_id;
          transaction.response = '{"createTransaction":';
          transaction.response += JSON.stringify(resultObj);
          transaction.response += "}";
          transaction.checkout_url = paymentclientResponse.checkout_url;
          transaction.status_url = paymentclientResponse.status_url;
        }
      } catch (err) {
        console.log("Coinpayments createTransaction, ", err);
        // TODO LOG ERROR IN DB OR LOG FILE
      }

      const CoinpaymentsGetTxOpts = {
        txid: transaction.txn_id,
        full: 1,
      };

      try {
        const resultObj = await this.paymentClient.getTx(CoinpaymentsGetTxOpts);
        if (!resultObj) {
          console.log("Coinpayments getTx failed");
          throw new Error("failed");
        } else {
          console.log(resultObj);
          console.log("RETRIEVE INFO FROM COINPAYMENTS");
          const paymentclientResponse: paymentclientGetTxInfoResponse = <paymentclientGetTxInfoResponse>resultObj;
          console.log(paymentclientResponse);
          if (transaction.response.length > 0) transaction.response += ", ";
          transaction.response += '{"getTx":';
          transaction.response += JSON.stringify(resultObj);
          transaction.response += "}";
          transaction.cp_status = paymentclientResponse.status;
          transaction.cp_status_text = paymentclientResponse.status_text;
        }
      } catch (err) {
        console.log("Coinpayments getTx, ", err);
        // TODO LOG ERROR IN DB OR LOG FILE
      }

      // PUT ERROR MESSAGE IN TRANSACTION / STATUS FOR CREATE
      // validation of the payload immediatly before mongoose validation
      // https://github.com/typestack/class-validator -> shared
    }

    console.log("MONGODB");
    console.log(transaction);

    return this.transactionsDB.addTransaction(transaction);
  }

  @ApiOperation({
    summary: "get all the transactions",
    description: `get all the transactions from our history document store while integrating a pagination`,
  })
  @Get()
  async findAllTransactions(
    @Query("sortOrder") sortOrder = "asc", // implicitly string
    @Query("pageNumber") pageNumber = 0, // implicitly number
    @Query("pageSize") pageSize = 100
  ): Promise<Transaction[]> {
    console.log("findAllTransactions ", sortOrder, pageNumber, pageSize);
    if (isNaN(Number(pageNumber))) {
      pageNumber = 0;
    }
    if (isNaN(Number(pageSize))) {
      pageSize = 100;
    }
    if (sortOrder != "asc" && sortOrder != "desc") {
      sortOrder = "asc";
    }
    console.log("findAllTransactions ", sortOrder, pageNumber, pageSize);

    return this.transactionsDB.findAll(sortOrder, pageNumber, pageSize);
  }

  @ApiOperation({
    summary: "get a transaction",
    description: `get a transaction from the document store based on the transaction id`,
  })
  @Get(":transactionId") // GUARDS?
  async findTransactionById(@Param("transactionId") transactionId: string) {
    console.log("Finding by transactionId", transactionId);

    const transaction = this.transactionsDB.findTransactionById(transactionId);

    if (!transaction) {
      throw new NotFoundException(`Could not find transaction for id${transactionId}`);
    }

    return transaction;
  }

  @ApiOperation({
    summary: "get the filtered available subscriptions",
    description: `get the filtered transactions, set all as a filter to retrieve all subscriptions`,
  })
  @Get("/subscriptions/:filter") // GUARDS?
  async findSubscriptions(@Param("filter") filter: string): Promise<Subscription[]> {
    console.log("Finding Subscriptions, filer", filter);

    return this.subscriptionsDB.findAll();
  }

  @ApiOperation({
    summary: "get the user subscription context",
    description: `get the user subscription context based on the user email parameter`,
  })
  @Get("/usersubscription/:email") // GUARDS?
  async findUserSubscription(@Param("email") email: string) {
    console.log("Finding User Subscription by email", email);
    // TO REPLACE JWT TOKEN
    // NEED A PAIR REVIEW for routing
    const usersubscription = new UserSubscription();
    usersubscription.buyer_email = email;
    usersubscription.expired = true;
    usersubscription.paid = false;
    usersubscription.subscription = null;
    usersubscription.message = "LOREM IPSUM in case of subscription ending or X due payments or ...";

    usersubscription.transactions = await this.transactionsDB.findTransactionsEmail(email);

    const lasttransactions = await this.transactionsDB.findExecutedTransactionsEmail(email);
    if (!lasttransactions || lasttransactions.length == 0) {
      // no transaction
      console.log("no transaction yet");
    } else {
      // log time sort order desc -> take the first one -> most recent
      const lasttransaction = lasttransactions[0];
      const subscription_id = lasttransaction.custom;
      usersubscription.id = subscription_id;
      const transactions = await this.transactionsDB.findExecutedTransactionsSubscriptionId(subscription_id);
      if (!transactions || transactions.length == 0) {
        // no transaction
        console.log("not able to find the last transaction and determine user subscription ");
      } else {
        // logtime sort order asc -> take teh first one -> older one to compute subscription duration
        const oldertransaction = transactions[0];
        const subscription = await this.subscriptionsDB.findSubscriptionByItemNumber(oldertransaction.item_number);
        if (!subscription) {
          console.log("no subscription anymore under that item number");
        } else {
          usersubscription.subscription = subscription;
          usersubscription.startdate = oldertransaction.logtime;
          const subscription_startdate = new Date(oldertransaction.logtime);
          const subscription_enddate = new Date(subscription_startdate);

          const { duration } = subscription;
          if (subscription.duration == -1) subscription.duration = 1; // TO REFACTOR

          subscription_enddate.setMonth(subscription_enddate.getMonth() + subscription.duration);
          const currentdate: Date = new Date();

          usersubscription.expired = subscription_enddate < currentdate;
          usersubscription.ellapsedmonths = -1;
          if (!usersubscription.expired) {
            usersubscription.ellapsedmonths =
              (currentdate.getFullYear() - subscription_startdate.getFullYear()) * 12 +
              (currentdate.getMonth() - subscription_startdate.getMonth());
            usersubscription.executed_payments = transactions.length;
            if (usersubscription.ellapsedmonths + 1 == transactions.length) {
              usersubscription.paid = true;
            }
          }
        }
      }
    }
    return usersubscription;
  }

  // taken from the url, not the best
  @ApiOperation({
    summary: "update a transaction",
    description: `update a transaction based on the transaction id`,
  })
  @Put(":transactionId")
  @UseGuards(AuthGuard("jwt"), SellerGuard)
  async updateTransaction(@Param("transactionId") transactionId: string, @Body() changes: Partial<Transaction>): Promise<Transaction> {
    console.log("updating transaction");

    if (changes._id) {
      throw new BadRequestException("Can't update transaction id");
    }

    return this.transactionsDB.updateTransaction(transactionId, changes);
  }

  @ApiOperation({
    summary: "delete a transaction",
    description: `delete a transaction based on the transaction id`,
  })
  @Delete(":transactionId")
  @UseGuards(AuthGuard("jwt"), SellerGuard)
  async deleteTransaction(@Param("transactionId") transactionId: string) {
    console.log("deleting transaction");

    return this.transactionsDB.deleteTransaction(transactionId);
  }
}
