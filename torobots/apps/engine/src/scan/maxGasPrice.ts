import { EventEmitter } from "events";
import Web3 from "web3";
import BigNumber from "bignumber.js";
import {
  Logger,
  IStoredBlockchain,
  IStoredNode,
  mongoDB,
} from "@torobot/shared";
export class MaxGasPrice extends EventEmitter {
  blockchain: IStoredBlockchain;
  node: IStoredNode;
  count: number = 0;
  rpcWeb3: Web3;
  gasPrices: number[] = [];
  storeLength: number = 3;
  logger: Logger;
  lock: boolean = false;
  private intervalID = null;

  get logPrefix() {
    return `maxGasPrice-`;
  }

  constructor(blockchain: IStoredBlockchain, node: IStoredNode) {
    super();
    this.blockchain = blockchain;
    this.node = node;
    this.rpcWeb3 = new Web3(this.node.rpcProviderURL);
  }

  start() {
    this.intervalID = setInterval(() => this.process(), 1000);
    this.lock = false;
  }

  async process() {
    if (this.blockchain.name === "Aurora") {
      return;
    }
    if (!this.rpcWeb3) {
      return;
    }
    if (this.lock) return;
    this.lock = true;
    try {
      const res = this.blockchain.name === "Harmony" ? await this.rpcWeb3.eth.getBlock("latest") : await this.rpcWeb3.eth.getBlock('pending');
      if (res.transactions && res.transactions?.length > 0) {
        for (let i = 0; i < res.transactions.length; i++) {
          const txHash = res.transactions[i];
          const tx = await this.rpcWeb3.eth.getTransaction(txHash);
          if (tx && tx?.gasPrice) {
            if (this.gasPrices.length < this.storeLength) {
              this.gasPrices.push(new BigNumber(tx.gasPrice).shiftedBy(-9).toNumber())
            } else {
              this.gasPrices[this.count % this.storeLength] = new BigNumber(tx.gasPrice).shiftedBy(-9).toNumber();
            }
            this.count++;
            break;
          }
        }
      }
      const chain = await mongoDB.Blockchains.findById(this.blockchain._id);
      chain.gasPrice = this.getMaxGasPrice();
      await chain.save();
    } catch (e) {
      // console.log(this.blockchain.name, "get pending block error: ", e);
    }
    this.lock = false;
  }

  getMaxGasPrice(): number {
    if (this.blockchain.name === "Aurora") return 0;
    let res = -1;
    for (let i = 0; i < this.gasPrices.length; i++) {
      if (res < this.gasPrices[i]) {
        res = this.gasPrices[i];
      }
    }
    return res;
  }
}