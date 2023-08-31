import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Contract } from "web3-eth-contract/types";
import * as BN from "bn.js";
import BigNumber from "bignumber.js";
import * as abi from "./abi/ubxt.json";
import Web3Service from "./web3.service";
import CipherService from "../shared/encryption.service";

// const Tx = require('ethereumjs-tx');
const Tx = require("ethereumjs-tx").Transaction;

@Injectable()
export default class UbxtContractService {
  private chainName: string;

  private contract: Contract;

  private contractAddress: string;

  private readonly reserveAddresses: string[];

  private readonly burnAddress: string;

  private readonly walletAddress: string;

  private readonly walletKey: string;

  private readonly logger = new Logger(UbxtContractService.name);

  private readonly maxGasPrice: number;

  private readonly maxGasLimit: number;

  constructor(private web3Service: Web3Service, private config: ConfigService, private cipherService: CipherService) {
    this.contractAddress = this.config.get<string>("UBXT_TOKEN");
    this.reserveAddresses = this.config.get<string>("RESERVE_TOKENS")?.split(" ");
    this.burnAddress = this.config.get<string>("PFS_DISTRIBUTION_ADDRESS_BURN");
    this.maxGasPrice = this.config.get<number>("MAX_GAS_PRICE");
    this.maxGasLimit = this.config.get<number>("MAX_GAS_LIMIT");

    this.walletAddress = this.config.get<string>("COMPANY_WALLET_ADDRESS");
    const walletPrivateKey = this.config.get<string>("COMPANY_WALLET_PRIVIATE_KEY");
    try {
      const encKey = this.config.get<string>("KEYSTORE_ENCK");
      const authKey = this.config.get<string>("KEYSTORE_AUTHK");
      this.walletKey = this.cipherService.decryptWithHmac(walletPrivateKey, encKey, authKey);
    } catch (e) {
      this.walletKey = walletPrivateKey;
    }

    // if (this.contractAddress === undefined || this.reserveAddresses === undefined) {
    //   throw new Error("Missing UBXT_TOKEN or RESERVE_TOKENS config variable. Please check your .env file");
    // }

    this.contract = new this.web3Service.web3.eth.Contract(abi as any, this.contractAddress) as any;
  }

  getContractAddress() {
    return this.contractAddress;
  }

  setChainName(chainName: string) {
    this.chainName = chainName;
    this.web3Service.setChainName(chainName);
    if (chainName === "BSC") {
      this.contractAddress = this.config.get<string>("BSC_UBXT_TOKEN");
    } else {
      this.contractAddress = this.config.get<string>("UBXT_TOKEN");
    }
    this.contract = new this.web3Service.web3.eth.Contract(abi as any, this.contractAddress) as any;
  }

  async inCirculation(): Promise<BN> {
    const reserves = await this.balancesOf(this.reserveAddresses);
    const totalSupply = await this.totalSupply();

    return reserves.reduce((acc, v) => acc.sub(v), totalSupply);
  }

  async totalSupply(): Promise<BN> {
    const result = await this.contract.methods.totalSupply().call();
    return this.web3Service.web3.utils.toBN(result);
  }

  async burnedAmount(): Promise<BN> {
    const result = await this.balanceOf(this.burnAddress);
    return result;
  }

  balancesOf(addresses: string[]): Promise<BN[]> {
    return Promise.all(addresses.map((a) => this.balanceOf(a)));
  }

  async balanceOf(address: string): Promise<BN> {
    const result = await this.contract.methods.balanceOf(address).call();
    return this.web3Service.web3.utils.toBN(result);
  }

  async getTxTransaction(hash: string) {
    const trx = await this.web3Service.web3.eth.getTransaction(hash);
    return trx;
  }

  async sendUBXT(toAddress: string, amount: number, onHash: Function | undefined = undefined, onReceipt: Function | undefined = undefined) {
    this.logger.debug(`***---PFS-sendUBXT: to:${toAddress}, amount:${amount}`);
    const gasPrice = await this.web3Service.web3.eth.getGasPrice();
    if (gasPrice > this.maxGasPrice) {
      this.logger.debug(`Suggested gas price ${gasPrice} is larger than max gas price ${this.maxGasPrice}`);
      // onReceipt(false, "Suggested gas price is larger than max gas price");
      // return false;
    }

    const decimal = 18;
    const nonce = await this.web3Service.web3.eth.getTransactionCount(this.walletAddress);

    // let pendingTxCount = 0;
    // pendingTxCount = await new Promise((resolve, reject) => {
    //   this.web3Service.web3.currentProvider.send({
    //     method: 'txpool_content',
    //     params: [],
    //     jsonrpc: '2.0',
    //     id: new Date().getTime()
    //   }, (error, response) => {
    //     if(response && response.error && response.error.code) {
    //       console.error('signTxData err:', response);
    //     }

    //     if(error) {
    //       reject(error);
    //     } else
    //     // Even though the API call didn't error the response can still contain
    //     // an error message.
    //     if(response && response.result && response.result.pending && response.result.pending[this.walletAddress]) {
    //       const txnsCount = Object.keys(response.result.pending[this.walletAddress]).length;
    //       resolve(txnsCount);
    //     }
    //     resolve(0);
    //   });
    // });
    // nonce += pendingTxCount;

    const amountFormatted = `0x${new BigNumber(amount).times(new BigNumber(10).pow(decimal)).toString(16).split(".")[0]}`;
    // amountFormatted =
    //   "0000000000000000000000000000000000000000000000000000000000000000".substr(0, 64 - amountFormatted.length) + amountFormatted;
    // const contractData = `0xa9059cbb000000000000000000000000${toAddress.substring(2)}${amountFormatted}`.toLowerCase();

    const contractData = this.contract.methods.transfer(toAddress, amountFormatted).encodeABI();
    try {
      const gasEstimate = await this.web3Service.web3.eth.estimateGas({
        from: this.walletAddress,
        to: this.contractAddress,
        data: contractData,
      });
      if (gasEstimate > this.maxGasLimit) {
        console.log(`Suggested gas limit ${gasEstimate} is larger than max gas limit ${this.maxGasLimit}`);
        // onReceipt(false, "Suggested gas limit is larger than max gas limit");
        // return false;
      }
      const fee = new BigNumber(gasPrice).times(gasEstimate).toString();

      const reqTransaction = {
        nonce: `0x${nonce.toString(16)}`,
        gasPrice: `0x${new BigNumber(gasPrice).toString(16)}`,
        gasLimit: `0x${new BigNumber(gasEstimate).toString(16)}`,
        // gasPrice: "0x6FC23AC00",
        // gasLimit: "0xF93E0",
        to: this.contractAddress,
        value: "0x00",
        data: contractData,
      };

      const tx = new Tx(reqTransaction, { chain: "mainnet" });
      const privateKey = Buffer.from(this.walletKey.replace("0x", ""), "hex");
      tx.sign(privateKey);
      const serializedTx = tx.serialize();

      this.web3Service.web3.eth
        .sendSignedTransaction(`0x${serializedTx.toString("hex")}`)
        .on("transactionHash", (hash) => {
          this.logger.debug(`***---PFS-sendUBXT-transactionHash: hash:${hash}`);
          if (onHash instanceof Function) {
            onHash(hash);
          }
        })
        .on("error", (err) => {
          this.logger.debug(`***---PFS-sendUBXT-error: hash:${err.message}`);
          onReceipt(false, err.message);
        })
        .on("receipt", (receipt) => {
          this.logger.debug(`***---PFS-sendUBXT-receipt: hash:${receipt.transactionHash}, status:${receipt.status}`);
          if (onReceipt instanceof Function) {
            onReceipt(receipt.status, "");
          }
        });
      return true;
    } catch (e) {
      onReceipt(false, e.message);
      this.logger.error(`***-***---PFS-sendUBXT-catch-error: ${e.message}`);
      return false;
    }
  }
}
