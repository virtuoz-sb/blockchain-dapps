/* eslint @typescript-eslint/no-var-requires: "off" */

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const Web3 = require("web3");

@Injectable()
export default class Web3Service {
  private rpcUrl: string;

  public web3: any;

  constructor(private configService: ConfigService) {
    this.setChainName("ETH");
  }

  setChainName(chainName: string) {
    if (chainName === "BSC") {
      this.rpcUrl = this.configService.get<string>("BSC_WEB3_RPC_PROVIDER");
    } else {
      this.rpcUrl = this.configService.get<string>("WEB3_PROVIDER_INFURA");
    }

    if (this.rpcUrl === undefined) {
      throw new Error("Missing WEB3_PROVIDER_INFURA config variable. Please check your .env file");
    }

    this.web3 = new Web3(new Web3.providers.HttpProvider(this.rpcUrl));
  }
}
