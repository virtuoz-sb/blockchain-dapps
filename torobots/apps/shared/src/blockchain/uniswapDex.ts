import { EventEmitter } from "events";
import * as web3Utils from "web3-utils";
import { BlockchainClient } from "./blockchainClient";
import { IBlockchain, IDex } from "../types";
import { Logger } from "../utils";
import factoryAbi from "./abis/uniswapV2Factory";
import routerAbi from "./abis/uniswapV2Router02";
import pairAbi from "./abis/uniswapV2Pair";
import BigNumber from "bignumber.js";

export class UniswapDex extends EventEmitter {
  logger: Logger;
  blockchainClient: BlockchainClient;
  blockchain: IBlockchain;
  dex: IDex;

  factoryContract: any;
  routerContract: any;

  get logPrefix() {
    return `uniswapDex-${this.dex.name}`;
  }
    
  constructor(blockchainClient: BlockchainClient, dex: IDex, logger?: Logger) {
    super();
    this.setMaxListeners(0);
    this.logger = logger ? logger : new Logger();
  
    this.blockchainClient = blockchainClient;
    this.blockchain = this.blockchainClient.blockchain;
    this.dex = dex;
  }

  async init() {
    this.blockchain = this.blockchainClient.blockchain;
    this.factoryContract = this.blockchainClient.getContract(this.dex.factoryAddress, factoryAbi as web3Utils.AbiItem[]);
    this.routerContract = this.blockchainClient.getContract(this.dex.routerAddress, routerAbi as web3Utils.AbiItem[]);

    // init log
    this.logger.log(this.logPrefix, 'info', 'init');
  }

  getPairContract(address: string, rpcWeb3: boolean=true): any {
    return this.blockchainClient.getContract(address, pairAbi as web3Utils.AbiItem[], rpcWeb3);
  }

  async buyToken(tokenIn: string, tokenOut: string, amountIn: string, toAddress: string, slippage?: number): Promise<any> {
    try {
      let path: string[];
      path = [tokenIn, tokenOut];
      let amountOutMin = "0";

      if (slippage !== undefined) {
        const amountOutMins = await this.routerContract.methods.getAmountsOut(amountIn, path).call();
        amountOutMin = new BigNumber(amountOutMins[path.length -1]).multipliedBy(100 - slippage).dividedBy(100).toFixed(0);
      }
      const deadline = Date.now() + 1000 * 60 * 5;

      // console.log(`${this.logPrefix()}buyToken:`, amountIn, amountOutMin, path, toAddress, deadline);
      const swapTransaction = this.routerContract.methods
        .swapExactTokensForTokens(amountIn, amountOutMin, path, toAddress, deadline);

      return swapTransaction;
    } catch (e) {
      this.logger.log(this.logPrefix, 'error', `buyToken-error: ${e.message}`);
      return null;
    }
  }

  async sellToken(tokenIn: string, tokenOut: string, amountIn: string, toAddress: string): Promise<any> {
    try {
      let path: string[];
      path = [tokenIn, tokenOut];

      const amountOutMin = 0;
      const deadline = Date.now() + 1000 * 60 * 5;

      const swapTransaction = this.routerContract.methods
        .swapExactTokensForTokensSupportingFeeOnTransferTokens(amountIn, amountOutMin, path, toAddress, deadline);

      return swapTransaction;
    } catch (e) {
      this.logger.log(this.logPrefix, 'error', `sellToken-error: ${e.message}`);
      return null;
    }
  }
};