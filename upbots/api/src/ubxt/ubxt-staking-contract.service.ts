import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { ConfigService } from "@nestjs/config";
import { Contract } from "web3-eth-contract/types";
import * as BN from "bn.js";
import { fromWei, toWei } from "web3-utils";
import BigNumber from "bignumber.js";
import * as abi from "./abi/ubxt-staking.json";
import * as vaultAbi from "./abi/usdt-vault.json";
import * as ubxtAbi from "./abi/ubxt.json";
import CipherService from "../shared/encryption.service";

/* eslint @typescript-eslint/no-var-requires: "off" */
const Web3 = require("web3");

@Injectable()
export default class UbxtStakingContractService {
  private rpcUrl: string;

  public web3: any;

  private readonly chainName: string;

  private readonly chainId: string;

  private readonly chainNetwork: string;

  private readonly contract: Contract;

  private readonly contractVault: Contract;

  private readonly contractAddress: string;

  private readonly ubxtContract: Contract;

  private readonly ubxtContractAddress: string;

  private readonly walletAddress: string;

  private readonly walletKey: string;

  private readonly poolAddress: string;

  private readonly logger = new Logger(UbxtStakingContractService.name);

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
      this.contractAddress = this.config.get<string>("BSC_UBXT_STAKING_CONTRACT");
      this.ubxtContractAddress = this.config.get<string>("BSC_UBXT_TOKEN");
    } else {
      this.contractAddress = this.config.get<string>("UBXT_STAKING_CONTRACT");
      this.ubxtContractAddress = this.config.get<string>("UBXT_TOKEN");
    }

    this.poolAddress = this.config.get<string>("PFS_DISTRIBUTION_ADDRESS_POOL");
    this.maxGasPrice = this.config.get<number>("MAX_GAS_PRICE");
    this.maxGasLimit = this.config.get<number>("MAX_GAS_LIMIT");
    this.walletAddress = this.config.get<string>("UBXT_STAKING_CONTRACT_OWNER_ADDRESS");
    const walletPrivateKey = this.config.get<string>("UBXT_STAKING_CONTRACT_OWNER_PRIVATE_KEY");
    try {
      const encKey = this.config.get<string>("KEYSTORE_ENCK");
      const authKey = this.config.get<string>("KEYSTORE_AUTHK");
      this.walletKey = this.cipherService.decryptWithHmac(walletPrivateKey, encKey, authKey);
    } catch (e) {
      this.walletKey = walletPrivateKey;
    }
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
    this.contractVault = new this.web3.eth.Contract(vaultAbi as any, "0xeD1e97E62730E83F1d56459C9025eB88F7F1E576") as any;
    this.ubxtContract = new this.web3.eth.Contract(ubxtAbi as any, this.ubxtContractAddress) as any;
  }

  async getTxTransaction(hash: string) {
    const trx = await this.web3.eth.getTransaction(hash);
    return trx;
  }

  async ubxtBalanceOf(address: string): Promise<BN> {
    const result = await this.ubxtContract.methods.balanceOf(address).call();
    return this.web3.utils.toBN(result);
  }

  async distributePerfPoolRewards(onHash: Function | undefined = undefined, onReceipt: Function | undefined = undefined) {
    console.log(`***---PFS-distributePerfPoolRewards`);
    const gasPrice = await this.web3.eth.getGasPrice();
    if (gasPrice > this.maxGasPrice) {
      this.logger.debug(`Suggested gas price ${gasPrice} is larger than max gas price ${this.maxGasPrice}`);
      // onReceipt(false, "Suggested gas price is larger than max gas price");
      // return false;
    }

    const decimal = 18;
    const nonce = await this.web3.eth.getTransactionCount(this.walletAddress);

    const contractData = this.contract.methods.distributePerfPoolRewards().encodeABI();
    try {
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
      const fee = new BigNumber(gasPrice).times(gasEstimate).toString();
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

      this.web3.eth
        .sendSignedTransaction(signedTx.rawTransaction)
        .on("transactionHash", (hash) => {
          this.logger.debug(`***---PFS-distributePerfPoolRewards-transactionHash: hash:${hash}`);
          if (onHash instanceof Function) {
            onHash(hash);
          }
        })
        .on("error", (err) => {
          this.logger.debug(`***---PFS-distributePerfPoolRewards-error: hash:${err.message}`);
          onReceipt(false, err.message);
        })
        .on("receipt", (receipt) => {
          this.logger.debug(`***---PFS-distributePerfPoolRewards-receipt: hash:${receipt.transactionHash}, status:${receipt.status}`);
          if (onReceipt instanceof Function) {
            onReceipt(receipt.status, "");
          }
        });
    } catch (e) {
      onReceipt(false, e.message);
      return false;
    }
    return true;
  }

  private onHashOfDistribution(): Function {
    const onHash = async (hash) => {
      console.log("***---PFS-onHashOfDistribution:", hash);
      return true;
    };

    return onHash;
  }

  private onReceiptOfDistribution(): Function {
    const onReceipt = async (status, message) => {
      console.log("***---PFS-onReceiptOfDistribution:", status, message);
      return true;
    };

    return onReceipt;
  }

  async distributeVaultRewards() {
    this.logger.log(`Claiming UBXT Vault`, `UbxtStakingContractService`);

    try {
      const nonce = await this.web3.eth.getTransactionCount("0xFC61B6bc8D251aa7d8D45Ab20d8d5Cf35879CDf1");
      const gasPrice = await this.web3.eth.getGasPrice();
      const contractData = this.contractVault.methods.claimVaultUBXT().encodeABI();

      const signedTx = await this.web3.eth.accounts.signTransaction(
        {
          to: "0xeD1e97E62730E83F1d56459C9025eB88F7F1E576",
          gas: 2000000,
          data: contractData,
          gasPrice,
          nonce,
          chainId: 56,
        },
        "e18012859f84294ae737ae58b781418e5881412b2f3acd3e93b7ff8ceea3b904"
      );

      this.web3.eth.sendSignedTransaction(signedTx.rawTransaction || signedTx.rawTransaction);
      return true;
    } catch (e) {
      this.logger.log(`UBXT Vault claiming failed ${e.message}`, `UbxtStakingContractService`);
      return false;
    }
  }

  @Cron("0 0 0 * * *", {
    name: "staking-pool-transaction",
    utcOffset: 0,
  }) // Cron every 24 hours
  // @Cron("0 * * * * *") // Cron every 1 min
  async handleDistribution() {
    console.log("!!!---PFS-ubxt-staking-distribution-handleDistribution");
    // process pending user transactions
    const perfPoolAmountBN = await this.ubxtBalanceOf(this.poolAddress);
    const perfPoolAmount = Number(fromWei(perfPoolAmountBN));
    console.log("***---PFS-ubxt-staking-distribution:", perfPoolAmount);
    if (perfPoolAmount > 1) {
      await this.distributePerfPoolRewards(this.onHashOfDistribution, this.onReceiptOfDistribution);
      // const nowTime = new Date().toUTCString();
      // await this.settingsDataService.setVariable("staking-distribution-last-time", nowTime);
    }

    // process usdt vault rewards
    // await this.distributeVaultRewards();
  }
}
