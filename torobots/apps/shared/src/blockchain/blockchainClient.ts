import BigNumber from "bignumber.js";
import Web3 from "web3";
import { Account, Transaction, TransactionReceipt } from "web3-core";
import * as web3Utils from "web3-utils";
import { EventEmitter } from "events";
import { IBlockchain, INode, IWallet, STATUS_SUCCESS, STATUS_ERROR, Response } from "../types";
import { Logger, waitFor, shiftedBigNumber } from "../utils";
import { respond } from "../utils";

export class BlockchainClient extends EventEmitter {
  logger: Logger;
  blockchain: IBlockchain;
  node: INode;
  wallet?: IWallet;
  account?: Account;
  accountBalance: BigNumber;
  rpcWeb3: Web3;
  wsWeb3: Web3;

  get logPrefix() {
    return `blockchainClient-${this.blockchain.chainId}`;
  }

  constructor(blockchain: IBlockchain, node?: INode, wallet?: IWallet, logger?: Logger) {
    super();
    this.setMaxListeners(0);
    this.logger = logger ? logger : new Logger();
      
    this.blockchain = blockchain;
    this.node = node ? node : this.blockchain.node as INode;
    this.wallet = wallet ? wallet : undefined;
    this.account = undefined;
  }

  async init() {
    const providerWsURL = this.node.wsProviderURL;
    const providerRpcURL = this.node.rpcProviderURL;
    const wsProvider = new Web3.providers.WebsocketProvider(
      providerWsURL, 
      {
        timeout: 30000, // ms
    
        clientConfig: {
          // Useful if requests are large
          maxReceivedFrameSize: 100000000, // bytes - default: 1MiB
          maxReceivedMessageSize: 100000000, // bytes - default: 8MiB
      
          // Useful to keep a connection alive
          keepalive: true,
          keepaliveInterval: 60000 // ms
        },
      
        // Enable auto reconnection
        reconnect: {
          auto: true,
          delay: 3000, // ms
          maxAttempts: 10,
          onTimeout: true
        },
      }
    );
    const rpcProvider = new Web3.providers.HttpProvider(providerRpcURL);
    this.wsWeb3 = new Web3(wsProvider);
    this.rpcWeb3 = new Web3(rpcProvider);
    if (this.wallet) {
      this.account = this.web3.eth.accounts.privateKeyToAccount(this.wallet.privateKey);
      await this.updateBalance();
    }

    // init log
    // const gasPrice = await this.getGasPrice();
    // const gasLimit = await this.getGasLimit();
    // console.log(`${this.logPrefix()}init: (gasPrice:${gasPrice}, gasLimit:${gasLimit})`)
    this.logger.log(this.logPrefix, 'info', 'init');
  }

  get web3(): Web3 {
    return this.rpcWeb3;
  }

  async updateBalance() {
    if (this.account) {
      this.accountBalance = shiftedBigNumber(
        await this.web3.eth.getBalance(this.account.address)
      );  
    }
  }

  getContract(address: string, abi: web3Utils.AbiItem[], rpcWeb3: boolean=true): any {
    if (rpcWeb3) {
      return new this.rpcWeb3.eth.Contract(abi, address);
    }
    return new this.wsWeb3.eth.Contract(abi, address);
  }

  async getBlockNumber(): Promise<number> {
    return this.web3.eth.getBlockNumber();
  }

  async getGasPrice(): Promise<string> {
    const gasPrice = await this.web3.eth.getGasPrice();
    return gasPrice;
  }

  async getGasLimit(): Promise<number> {
    const gasLimit = (await this.web3.eth.getBlock("latest")).gasLimit;
    return gasLimit;
  }

  getTransaction(txHash: string): Promise<Transaction> {
    return this.web3.eth.getTransaction(txHash);
  }

  getTransactionReceipt(txHash: string): Promise<any> {
    return this.web3.eth.getTransactionReceipt(txHash);
  }

  async sendSignedTransaction(to: string, transaction: any, amount?: number, gasPrice?: string, gas?: number): Promise<Response> {
    if (!this.account) {
      return respond.error(null);
    }

    try {
      const account = this.account;
      const value = amount ? web3Utils.toWei(String(amount)) : 0;
      const nonce = await this.web3.eth.getTransactionCount(account.address);
      const gasPriceN = gasPrice ? gasPrice : await this.getGasPrice();
      const gasN = gas ? gas : 2100000;
      const data = transaction.encodeABI();
  
      const options = {
        value,
        nonce, 
        data,
        to,
        gasPrice: gasPriceN,
        gas: gasN,
        chainId: Number(this.blockchain.chainId),
      };

      const signedTx = await this.web3.eth.accounts.signTransaction(options, account.privateKey);
      if (signedTx.rawTransaction) {
        const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        return respond.success(receipt);
      }
      return respond.error(null);
    } catch (e) {
      this.logger.log(this.logPrefix, 'error', `sendSignedTransaction-error: ${e.message},${e.name}`);
      return respond.error(e);
    }
  }

  async sendSignedTransactionByPrivateKey(from: string, privateKey: string, to: string, transaction: any, amount?: number, gasPrice?: string, gas?: number): Promise<Response> {
    try {
      const value = amount ? web3Utils.toWei(String(amount)) : 0;
      const nonce = await this.web3.eth.getTransactionCount(from);
      const gasPriceN = gasPrice ? gasPrice : await this.getGasPrice();
      const gasN = gas ? gas : 2100000;
      const data = transaction.encodeABI();
  
      const options = {
        from,
        value,
        nonce, 
        data,
        to,
        gasPrice: gasPriceN,
        gas: gasN,
        chainId: Number(this.blockchain.chainId),
      };

      const signedTx = await this.web3.eth.accounts.signTransaction(options, privateKey);
      if (signedTx.rawTransaction) {
        const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        return respond.success(receipt);
      }
      return respond.error(null);
    } catch (e) {
      this.logger.log(this.logPrefix, 'error', `sendSignedTransaction-error: ${e.message},${e.name}`);
      return respond.error(e);
    }
  }

  async waitForTransaction(
    txHash: string,
    blockConfirmations = 5
  ): Promise<typeof STATUS_ERROR | typeof STATUS_SUCCESS> {
    return new Promise(async (resolve, reject) => {
      let numTries = 0;
      let complete = false;

      while (!complete) {
        if (numTries > 0) await waitFor(2000);
        const receipt = await this.web3.eth.getTransactionReceipt(txHash);
        if (receipt) {
          const currentBlock = await this.web3.eth.getBlockNumber();
          const txBlock = receipt.blockNumber;
          if (txBlock && currentBlock - txBlock >= blockConfirmations) {
            const transaction = await this.web3.eth.getTransaction(txHash);
            complete = true;
            if (transaction.blockNumber) {
              resolve(STATUS_SUCCESS);
            } else resolve(STATUS_ERROR);
          }
        } else {
          numTries++;
        }
      }
      resolve(STATUS_ERROR);
    });
  }  
}
