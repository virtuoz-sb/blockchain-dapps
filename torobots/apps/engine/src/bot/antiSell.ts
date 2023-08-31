import * as web3Utils from "web3-utils";
import { 
  ETradingThread, 
  STATUS_SUCCESS, STATUS_PROCESSING, 
  shiftedBigNumber, Response, waitFor 
} from "@torobot/shared";

import { BotThread } from "./botThread";
import { BotClient } from "./botClient";
import BigNumber from "bignumber.js";

/**
 * Anti sell detected 
 * Once coin is purchased, automatically approve token for sale & sell 1% of token holdings to see if we are able to sell, if not, auto-enable spam sell
 */
export class AntiSell extends BotThread {
  startSell: number;
  get logPrefix() {
    return `antiSell`;
  }

  constructor(type: ETradingThread, botClient: BotClient) {
    super(type, botClient);
    this.init();
  }

  async init() {
    super.init();
  }

  async start() {
    this.logger.log(this.logPrefix, 'info', "==================     Anti Sell     ===============");
    // get token balance and update db
    await this.tokenERC20.updateBalance();
    this.bot.sell.amount = this.tokenERC20.userBalance.toString();
    // console.log("sell amount (wallet): ", this.bot.sell.amount);
    this.onUpdated(this.type);

    // if wallet token balance is zero,  ///////////////////////////////////////////////////
    if (this.tokenERC20.userBalance.isZero()) {
      this.onFinished(this.type);
      this.stop();
      return;
    }
    super.start();
    const res = await this.process();
    this.stop();
  }

  async stop() {
    super.stop();
  }

  async process(): Promise<boolean>{
    // getting wallet info /////////////////////////////////
    const address = this.wallet.publicKey;
    const gasPrice = web3Utils.toWei(String(this.bot.buy.gasPrice), 'Gwei');
    const coinAddress = this.coinAddress;
    const sellToken = this.tokenAddress;
    /** inAmount = wallet token amount / 100  (1%) */
    const inAmount = shiftedBigNumber(new BigNumber(this.bot.sell.amount).toString(), this.tokenERC20.decimals - 2, "positive").toFixed(2).split('.')[0];

    // approving ///////////////////////////////////////////    
    const isApproved = await this.approve(ETradingThread.APPROVING_SELL, shiftedBigNumber(inAmount, this.tokenERC20.decimals));
    if (isApproved === false) { return false;}

    // sell ////////////////////////////////////////////////
    this.onUpdated(this.type, STATUS_PROCESSING);
    try {
      const txCall = await this.swapDex.sellToken(sellToken, coinAddress, inAmount, address);
      const txRes: Response = await this.blockchainClient.sendSignedTransaction(this.dex.routerAddress, txCall, 0, gasPrice);

      if (txRes.status === STATUS_SUCCESS) {
        this.logger.log(this.logPrefix, 'info', `process-res: transactionHash(${txRes.data.transactionHash})`);
        const qRes = await this.blockchainClient.getTransactionReceipt(txRes.data.transactionHash);
        let amountOut = new BigNumber(0);
        if (qRes.logs) {
          for (const log of qRes.logs) {
            if (log.topics) {
              if (log.topics.length === 3) {
                // Get pair contract address
                const pairContractAddress = await this.swapDex.factoryContract.methods.getPair(this.coinAddress, this.tokenAddress).call();
                if (pairContractAddress) {
                  // Transfer
                  if (log.topics[0] === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" &&
                    pairContractAddress.toLowerCase().indexOf(log.topics[1].substr(-40)) > -1
                    && address.toLowerCase().indexOf(log.topics[2].substr(-40)) > -1
                  ){
                    amountOut = new BigNumber(log.data).shiftedBy(-this.coinERC20.decimals);
                    break;
                  }
                }
              }
            }
          }
        }
        // update Statistics ////////////////////////////////////////////////////////
        this.updateStatistics(
          0,                                                  /** buyCoinAmount   */
          0,                                                  /** buyTokenAmount  */
          0,                                                  /** buyFee          */
          amountOut.toNumber(),                               /** sellCoinAmount  */
          Number(this.bot.sell.amount) / 100,                 /** sellTokenAmount */
          qRes.gasUsed * this.bot.buy.gasPrice / 1000000000   /** sellFee         */
        );

        this.onUpdated(this.type, STATUS_SUCCESS);

        this.onTransaction(
          this.type,                                          /** thread          */
          STATUS_SUCCESS,                                     /** result          */
          1,                                                  /** tryCount        */
          txRes.data.transactionHash,                         /** txHash          */
          qRes.gasUsed * this.bot.buy.gasPrice / 1000000000,  /** gasFee          */
          amountOut.toNumber(),                               /** coinAmount      */
          Number(this.bot.sell.amount) / 100                  /** tokenAmount     */
        );

        // we need to wait for enough time to save data.
        await waitFor(1000);
        return true;
      } else {
        if (txRes.data !== null) {
          const error: Error = txRes.data;
          if (error.message.indexOf('Transaction has been reverted by the EVM:') > -1) {
            const _gasUsed = Number(error.message.split('"gasUsed": ')[1].split(",")[0]);
            this.updateStatistics(
              0,                                              /** buyCoinAmount   */
              0,                                              /** buyTokenAmount  */
              0,                                              /** buyFee          */
              0,                                              /** sellCoinAmount  */
              0,                                              /** sellTokenAmount */
              _gasUsed * this.bot.buy.gasPrice / 1000000000   /** sellFee         */
            );
          }
        }
      }
    } catch (e) {
      this.logger.log(this.logPrefix, 'info', `process-err: error(${e.message})`);
    }
    this.emit("failed one percent sell");
    return false;
  }
}
