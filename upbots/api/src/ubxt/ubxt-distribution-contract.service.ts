import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Contract } from "web3-eth-contract/types";
import * as BN from "bn.js";
import BigNumber from "bignumber.js";
import * as abi from "./abi/ubxt-distribution.json";
import CipherService from "../shared/encryption.service";

/* eslint @typescript-eslint/no-var-requires: "off" */
const Web3 = require("web3");

@Injectable()
export default class UbxtDistributionContractService {
  private rpcUrl: string;

  public web3: any;

  private readonly chainName: string;

  private readonly chainId: string;

  private readonly chainNetwork: string;

  private readonly contract: Contract;

  private readonly contractAddress: string;

  private readonly tokenAddress: string;

  private readonly walletAddress: string;

  private readonly walletKey: string;

  private readonly logger = new Logger(UbxtDistributionContractService.name);

  private readonly maxGasPrice: number;

  private readonly maxGasLimit: number;

  constructor(private config: ConfigService, private cipherService: CipherService) {
    this.chainName = this.config.get<string>("PFS_DISTRIBUTION_CHAIN_NAME");
    if (!this.chainName || this.chainName === "") {
      this.chainName = "ETH";
    }

    this.chainId = this.config.get<string>("PFS_DISTRIBUTION_CHAIN_ID");
    if (!this.chainId || this.chainId === "") {
      this.chainId = "3";
    }
    this.chainNetwork = this.config.get<string>("PFS_DISTRIBUTION_CHAIN_NETWORK");
    if (!this.chainNetwork || this.chainNetwork === "") {
      this.chainNetwork = "ropsten";
    }
    if (this.chainName === "BSC") {
      this.contractAddress = this.config.get<string>("BSC_UBXT_DISTRIBUTION_CONTRACT");
      this.tokenAddress = this.config.get<string>("BSC_UBXT_TOKEN");
    } else {
      this.contractAddress = this.config.get<string>("UBXT_DISTRIBUTION_CONTRACT");
      this.tokenAddress = this.config.get<string>("UBXT_TOKEN");
    }
    this.walletAddress = this.config.get<string>("COMPANY_WALLET_ADDRESS");
    const walletPrivateKey = this.config.get<string>("COMPANY_WALLET_PRIVIATE_KEY");
    try {
      const encKey = this.config.get<string>("KEYSTORE_ENCK");
      const authKey = this.config.get<string>("KEYSTORE_AUTHK");
      this.walletKey = this.cipherService.decryptWithHmac(walletPrivateKey, encKey, authKey);
    } catch (e) {
      this.walletKey = walletPrivateKey;
    }
    this.maxGasPrice = this.config.get<number>("MAX_GAS_PRICE");
    this.maxGasLimit = this.config.get<number>("MAX_GAS_LIMIT");

    // if (this.contractAddress === undefined) {
    //   throw new Error("Missing UBXT_Distribution config variable. Please check your .env file");
    // }

    if (this.chainName === "BSC") {
      this.rpcUrl = this.config.get<string>("BSC_WEB3_RPC_PROVIDER");
    } else {
      this.rpcUrl = this.config.get<string>("WEB3_PROVIDER_INFURA");
    }
    this.web3 = new Web3(new Web3.providers.HttpProvider(this.rpcUrl));

    this.contract = new this.web3.eth.Contract(abi as any, this.contractAddress) as any;
  }

  async getTxTransaction(hash: string) {
    const trx = await this.web3.eth.getTransaction(hash);
    return trx;
  }

  getExplorerUrlByHash(hash: string) {
    let explorer = "";
    if (this.chainName === "BSC") {
      explorer = `${process.env.BSCSCAN_URL}${hash}`;
    } else {
      explorer = `${process.env.ETHERSCAN_URL}${hash}`;
    }
    return explorer;
  }

  async distributeToken(
    developer: string,
    amountForDeveloper: number,
    reserved: string,
    amountForReserved: number,
    pool: string,
    amountForPool: number,
    burn: string,
    amountForBurn: number,
    onHash: Function | undefined = undefined,
    onReceipt: Function | undefined = undefined
  ) {
    console.log(
      `***---PFS-distributeUBXT: developer:${developer}, amountForDeveloper:${amountForDeveloper}, developer:${reserved}, amountForDeveloper:${amountForReserved}, developer:${burn}, amountForDeveloper:${amountForBurn}, developer:${pool}, amountForDeveloper:${amountForPool}`
    );

    const gasPrice = await this.web3.eth.getGasPrice();
    if (gasPrice > this.maxGasPrice) {
      this.logger.debug(`Suggested gas price ${gasPrice} is larger than max gas price ${this.maxGasPrice}`);
      // onReceipt(false, "Suggested gas price is larger than max gas price");
      // return false;
    }

    const decimal = 18;
    const nonce = await this.web3.eth.getTransactionCount(this.walletAddress);

    const amountFormatted1 = `0x${new BigNumber(amountForDeveloper).times(new BigNumber(10).pow(decimal)).toString(16).split(".")[0]}`;
    const amountFormatted2 = `0x${new BigNumber(amountForReserved).times(new BigNumber(10).pow(decimal)).toString(16).split(".")[0]}`;
    const amountFormatted3 = `0x${new BigNumber(amountForBurn).times(new BigNumber(10).pow(decimal)).toString(16).split(".")[0]}`;
    const amountFormatted4 = `0x${new BigNumber(amountForPool).times(new BigNumber(10).pow(decimal)).toString(16).split(".")[0]}`;
    const recipients = [developer, reserved, burn, pool];
    const amounts = [amountFormatted1, amountFormatted2, amountFormatted3, amountFormatted4];

    const isTokenDispersible = await this.contract.methods.isTokenDispersible(this.contractAddress, this.tokenAddress, amounts).call();
    if (!isTokenDispersible) {
      console.log("***---PFS-distributeUBXT-insufficient token");
      onReceipt(false, "Insufficient token amount");
      return false;
    }

    const contractData = this.contract.methods.disperseToken(false, this.tokenAddress, recipients, amounts).encodeABI();

    const gasEstimate = await this.web3.eth.estimateGas({
      from: this.walletAddress,
      to: this.contractAddress,
      data: contractData,
    });
    if (gasEstimate > this.maxGasLimit) {
      console.log(`Suggested gas limit ${gasEstimate} is larger than max gas limit ${this.maxGasLimit}`);
      // onReceipt(false, "Suggested gas limit is larger than max gas limit");
      // return false;
    }

    const gas0 = Math.round(Number(gasEstimate) * 1.04);
    const gasPrice0 = Math.round(Number(gasPrice) * 1.1);
    const signedTx = await this.web3.eth.accounts.signTransaction(
      {
        to: this.contractAddress,
        data: contractData,
        gas: gas0,
        gasPrice: gasPrice0,
        nonce,
        chainId: Number(this.chainId),
      },
      this.walletKey
    );

    try {
      this.web3.eth
        .sendSignedTransaction(signedTx.rawTransaction)
        .on("transactionHash", (hash) => {
          this.logger.debug(`***---PFS-distributeUBXT-transactionHash: hash:${hash}`);
          if (onHash instanceof Function) {
            onHash(hash, this.getExplorerUrlByHash(hash));
          }
        })
        .on("error", (err) => {
          this.logger.debug(`***---PFS-distributeUBXT-error: hash:${err.message}`);
          onReceipt(false, err.message);
        })
        .on("receipt", (receipt) => {
          this.logger.debug(`***---PFS-distributeUBXT-receipt: hash:${receipt.transactionHash}, status:${receipt.status}`);
          if (onReceipt instanceof Function) {
            onReceipt(receipt.status, "");
          }
        });
      return true;
    } catch (e) {
      this.logger.error(`***-***---PFS-distributeUBXT-catch-error: ${e.message}`);
      onReceipt(false, e.message);
      return false;
    }
  }
}
