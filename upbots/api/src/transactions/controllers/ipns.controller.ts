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
import { Request, Response } from "express";
import * as crypto from "crypto";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import TransactionsRepository from "../repositories/transactions.repository";
import IpnsRepository from "../repositories/ipns.repository";
import Ipn from "../dbmodels/ipn";

/*
 * COINPAYMENTS CONFIG AND INIT
 */
// https://www.coinpayments.net/merchant-tools-ipn
// CLEAN CONSTANT TO DO
const coinpayments = require("coinpayments");

// Instant Payment Notifications
// whitelist has to be set to protect this api controller
@ApiTags("ipns")
@Controller("ipns")
export default class IpnsController {
  paymentClient: any;

  constructor(private transactionsDB: TransactionsRepository, private ipnsDB: IpnsRepository, private config: ConfigService) {
    const CoinpaymentsCredentials = {
      key: this.config.get<string>("NESTJS_API_CP_KEY"),
      secret: this.config.get<string>("NESTJS_API_CP_SECRET"),
    };
    this.paymentClient = new coinpayments(CoinpaymentsCredentials);
  }

  @ApiOperation({
    summary: "health checker",
    description: `get the health of the ipns endpoint`,
  })
  @Get()
  healthcheck(@Req() req: Request) {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("healthcheck: ok");
    console.log("ip: ", ip);

    return { healthcheck: "ok", date: new Date() };
  }

  @ApiOperation({
    summary: "payment handler",
    description: `handle the payment gateway calls`,
  })
  @Post()
  async handler(@Req() req: Request, @Res() res: Response, @Body() ipn: Partial<Ipn>) {
    console.log("handler: begin");
    let ret = "OK";
    try {
      // Fill these in with the information from your CoinPayments.net account.
      // to put in constants or env or config < project policy
      const cp_merchant_id = this.config.get<string>("NESTJS_API_MERCHANT_ID");
      const cp_ipn_secret = this.config.get<string>("NESTJS_API_IPN_SECRET");
      // const cp_debug_email = 'payments@cogarius.com';
      // use mongodb instead of emails or kibana (it would be ideal for stack trace)

      console.log("headers", req.headers);
      console.log("ipn", ipn);

      // log IPN call in mongo db schemas is there
      if (ipn.merchant != cp_merchant_id) {
        console.log("No or incorrect Merchant ID passed");
      } else if (ipn.ipn_type != "api") {
        console.log("IPN Type is not api");
        if (
          ipn.ipn_type == "simple" ||
          ipn.ipn_type == "button" ||
          ipn.ipn_type == "cart" ||
          ipn.ipn_type == "donation" ||
          ipn.ipn_type == "deposit" ||
          ipn.ipn_type == "withdrawal"
        ) {
          console.log("IPN is used globally for other transactions");
          this.ipnsDB.addIpn(ipn);
        }
      } else if (ipn.ipn_mode != "hmac") {
        console.log("IPN Mode is not HMAC");
      } else if (req.header("HTTP_HMAC") == "") {
        console.log("No HMAC signature sent");
      } else {
        console.log("core checks: ok");

        // check HMAC
        // $hmac = hash_hmac("sha512", $request, trim($cp_ipn_secret));
        // https://www.php.net/manual/en/function.hash-hmac.php
        // https://stackoverflow.com/questions/36924021/hash-hmac-equivalent-in-node-js

        const { body } = req;
        console.log("body: ", body);

        ipn.http_hmac = req.header("HMAC");
        const HMAC = crypto.createHmac("sha512", cp_ipn_secret.trim());
        ipn.verifyer_hmac = HMAC.update(Buffer.from(JSON.stringify(body), "utf-8")).digest("hex");

        console.log("HTTP_HMAC: ", ipn.http_hmac);
        console.log("VERIFYER_HMAC: ", ipn.verifyer_hmac);
        console.log("ipn with hmac", ipn);
        ipn.amount1 = isNaN(ipn.amount1) ? 0 : ipn.amount1;
        ipn.amount2 = isNaN(ipn.amount2) ? 0 : ipn.amount2;
        ipn.fee = isNaN(ipn.fee) ? 0 : ipn.fee;
        ipn.received_amount = isNaN(ipn.received_amount) ? 0 : ipn.received_amount;
        ipn.received_confirms = isNaN(ipn.received_confirms) ? 0 : ipn.received_confirms;
        console.log("ipn with number check", ipn);
        ipn.logtime = new Date().toLocaleString();
        console.log("ipn with logtime", ipn);

        // mongodb log
        this.ipnsDB.addIpn(ipn);

        if (ipn.http_hmac == "") {
          console.log("No HMAC signature sent");
        } else {
          // npm i -S hash-equals
          const hashEquals = require("hash-equals");
          if (!hashEquals(ipn.verifyer_hmac, ipn.http_hmac)) {
            console.log("HMAC signature does not match");
          } else {
            console.log("HMAC signature matches");
            // https://www.coinpayments.net/downloads/cpipn.phps
            // check with mongodb transaction
            // These would normally be loaded from your database, the most common way is to pass the Order ID through the 'custom' POST field.
            const order_currency = "";
            const order_total = 10.0;
            // check status
          }
          //---------------------------------------------
          // CODE TO PU IN HMAC signature matches : BEGIN
          //---------------------------------------------
          // LOOK ON txn_id IN MONGODB ON TRANSACTION
          if (ipn.txn_id == "") {
            // TEST TO PUT UPSTAIR BEFORE HMAC
            console.log("txn_id is missing");
          } else {
            console.log("txn_id: ", ipn.txn_id);
            const transaction = await this.transactionsDB.findTransactionByTxnId(ipn.txn_id);
            if (!transaction) {
              console.log("transaction for txn_id is missing");
            } else {
              console.log("transaction: ", transaction);

              // Check the original currency to make sure the buyer didn't change it.
              if (ipn.currency1 != transaction.currency1) {
                console.log("Original currency mismatch!", ipn.currency1, transaction.currency1);
              } else if (ipn.amount1 < transaction.amount) {
                // Check amount against order total
                console.log("Amount is less than order total!");
              } else if (ipn.status >= 100 || ipn.status == 2) {
                // payment is complete or queued for nightly payout, success
                console.log("payment is complete or queued for nightly payout, success");
                if (transaction.status != "EXECUTED") {
                  // to avoid an update sur an already complete transaction
                  transaction.status = "EXECUTED";
                  transaction.cp_status = ipn.status;
                  transaction.cp_status_text = ipn.status_text;
                  const transactionUpdated = await this.transactionsDB.updateTransaction(transaction._id, transaction);
                  console.log("transactionUpdated: ", transactionUpdated);
                } else {
                  console.log("duplicate update attempt detected");
                }
              } else if (ipn.status < 0) {
                // payment error, this is usually final but payments will sometimes be reopened if there was no exchange rate conversion or with seller consent
                console.log(
                  "payment error, this is usually final but payments will sometimes be reopened if there was no exchange rate conversion or with seller consent"
                );
                transaction.status = "ERROR";
                transaction.cp_status = ipn.status;
                transaction.cp_status_text = ipn.status_text;
                const transactionUpdated = await this.transactionsDB.updateTransaction(transaction._id, transaction);
                console.log("transactionUpdated: ", transactionUpdated);
              } else if (ipn.status == 1) {
                // payment is pending, you can optionally add a note to the order page
                console.log("payment is pending, you can optionally add a note to the order page");
                if (transaction.status != "EXECUTED") {
                  transaction.status = "CAPTURED";
                  transaction.cp_status = ipn.status;
                  transaction.cp_status_text = ipn.status_text;
                  const transactionUpdated = await this.transactionsDB.updateTransaction(transaction._id, transaction);
                  console.log("transactionUpdated: ", transactionUpdated);
                } else {
                  console.log("duplicate update attempt detected");
                }
              }
            }
          }
          //---------------------------------------------
          // CODE TO PUT IN HMAC signature matches : END
          //---------------------------------------------
        }
      }
    } catch (err) {
      console.log("Coinpayments ipns handler, ", err);
      ret = "KO";
      // TODO LOG ERROR IN DB OR LOG FILE
    }

    console.log("handler: end");
    return { handler: ret, date: new Date() };
  }
}
