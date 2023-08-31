import * as web3Utils from "web3-utils";
import { EventEmitter } from "events";
import { IBot, ETradingThread, STATUS_SUCCESS, STATUS_ERROR, Response } from "@torobot/shared";
import { BotThread } from "./botThread";
import { BotClient } from "./botClient";
import BigNumber from "bignumber.js";

export class BuyEvent extends BotThread {
  eventReceived: boolean = false;
  pairContractAddress: string = "";
  pairContractEvents: EventEmitter;
  txCounter: number;
  resCounter: number;
  private intervalID = null;

  get logPrefix() {
    return `buyEvent`;
  }

  constructor(type: ETradingThread, botClient: BotClient) {
    super(type, botClient);
    this.init();
  }

  async init() {
    super.init();
  }

  async start() {
    this.pairContractAddress === "";
    this.txCounter = 0;
    this.resCounter = 0;
    super.start();
    // approving
    const isApproved = await this.approve(ETradingThread.APPROVING_BUY, new BigNumber(this.bot.buy.amount));
    if (isApproved === false) {
      this.onFinished(this.type);
      super.stop();
      return;
    }

    this.logger.log(this.logPrefix, 'info', "==================     EVENT BUYING     ===============");
    this.intervalID = setInterval(() => this.process(), 1000);
  }

  async handleEvent(eventData: any) {
    if (this.eventReceived) {
      return;
    }
    let { event } = eventData;
    if (event === null || event === undefined) {
      const topic0 = eventData.raw.topics[0];
      if (topic0 === "0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f") {
        event = "Mint";
      }
      if (topic0 === "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822") {
        event = "Swap"
      }
    }

    if (event === "Mint" || event === "Swap") {
      this.logger.log(this.logPrefix, 'info', "EVENT RECEIVED");
      this.pairContractEvents.removeAllListeners("data");
      this.eventReceived = true;
    }
  }
  stop() {
    clearInterval(this.intervalID);
    this.intervalID = null;

    super.stop();
    this.txCounter = 0;
    this.resCounter = 0;
  }

  async process() {
    if (this.processed) {
      if (this.txCounter === this.resCounter) {
        this.onFinished(this.type);
        this.stop();
      }
      return;
    }
    if (this.eventReceived) {
      const address = this.wallet.publicKey;
      const inAmount = web3Utils.toWei(String(this.bot.buy.amount));
      const gasPrice = web3Utils.toWei(String(this.bot.buy.gasPrice), 'Gwei');
      const coinAddress = this.coinAddress;
      const tokenAddress = this.tokenAddress;

      if (this.txCounter === 0) {
        this.logger.log(this.logPrefix, 'info', `process-init: try(${this.txCounter}), coin(${coinAddress}), token(${tokenAddress}), amount(${this.bot.buy.amount}), gasPrice(${this.bot.buy.gasPrice})`);
      } else {
        this.logger.log(this.logPrefix, 'info', `processing: tx(${this.txCounter}), res(${this.resCounter})`);
      }

      this.txCounter++;
      try {
        const txCall = await this.swapDex.buyToken(
          coinAddress, tokenAddress, inAmount, address
        );

        const txRes: Response = await this.blockchainClient.sendSignedTransaction(
          this.dex.routerAddress, txCall, 0, gasPrice);

        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `process-res: transactionHash(${txRes.data.transactionHash})`);

          const qRes = await this.blockchainClient.getTransactionReceipt(txRes.data.transactionHash);
          let amountOut = new BigNumber(0);
          let rank: number = 0;
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
                      && address.toLowerCase().indexOf(log.topics[2].substr(-40)) > -1) {
                        amountOut = new BigNumber(log.data).shiftedBy(-this.tokenERC20.decimals);
                      // Get Ranking
                      const pairContract = this.swapDex.getPairContract(pairContractAddress);
                      const _events = await pairContract.getPastEvents('Swap', {fromBlock: qRes.blockNumber - 5000, toBlock: qRes.blockNumber});
                      const buy_events = _events.filter(item => item.returnValues.amount1In === '0');
                      for (const buy_event of buy_events) {
                        rank++;
                        if (buy_event.returnValues.to.toLowerCase() === address.toLowerCase()) {
                          break;
                        }
                      }
                      break;
                    }
                    // Swap
                    // if (log.topics[0] === "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822" &&
                    //   this.dex.routerAddress.toLowerCase().indexOf(log.topics[1].substr(-40)) > -1
                    //   && address.toLowerCase().indexOf(log.topics[2].substr(-40)) > -1) {
                    //     const amount0Out = new BigNumber(log.data.substr(-128, 64), 16);
                    //     const amount1Out = new BigNumber(log.data.substr(-64), 16);
                    //     amountOut = amount0Out.plus(amount1Out).shiftedBy(-this.tokenERC20.decimals);
                    //     console.log("------------------->", amountOut.toString());
                    //   break;
                    // }
                  }
                }
              }
            }
          }

          this.onUpdated(this.type, STATUS_SUCCESS);
          this.onTransaction(this.type, STATUS_SUCCESS, this.txCounter, txRes.data.transactionHash, qRes.gasUsed * this.bot.buy.gasPrice / 1000000000,
            this.bot.buy.amount, amountOut.toNumber(), rank > 0? rank.toString() : '');

          this.processed = true;
        } else {
          if (txRes.data !== null) {
            const error: Error = txRes.data;          
          }
        }
      } catch (e) {
        this.logger.log(this.logPrefix, 'info', `process-err: error(${e.message})`);
      }
      this.resCounter++;
    } else {
      console.log("try...");
      if (this.pairContractAddress === "") {
        try {
          const pairContractAddress = await this.swapDex.factoryContract.methods.getPair(
            this.coinAddress,
            this.tokenAddress
          ).call();
          if (pairContractAddress) {
            console.log(pairContractAddress);
            this.pairContractAddress = pairContractAddress;
            // when get pairContractAddress, register handleEvent for subscribing
            const pairContract = this.swapDex.getPairContract(this.pairContractAddress, false);
            this.pairContractEvents = pairContract.events.allEvents();
            this.pairContractEvents.on("data", this.handleEvent.bind(this));
          }
        } catch (e) {
          console.log(e);
        }
      } 
    }
  }
}
