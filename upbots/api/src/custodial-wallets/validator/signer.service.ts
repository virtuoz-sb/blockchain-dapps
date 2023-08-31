import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

// eslint-disable-next-line
const Web3 = require("web3");

@Injectable()
export default class SignerService {
  private readonly web3 = new Web3();

  private readonly skey = this.config.get("skey");

  constructor(private config: ConfigService) {}

  async sign(account: string, amount: string, nonce: string) {
    const params = [
      {
        type: "address",
        value: account,
      },
      {
        type: "uint256",
        value: amount,
      },
      {
        type: "uint256",
        value: nonce,
      },
    ];

    const packed = await this.web3.utils.soliditySha3(...params);
    const message = await this.web3.eth.accounts.sign(packed, this.skey);

    return message.signature;
  }
}
