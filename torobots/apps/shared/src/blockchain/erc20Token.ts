import BigNumber from "bignumber.js";
import { EventEmitter } from "events";
import * as web3Utils from "web3-utils";
import { Logger, formatNumber, shiftedBigNumber, smallToBig } from "../utils";
import { IToken, events, MAX_NUM } from "../types";
import { BlockchainClient } from "./blockchainClient";
import ERC20ABI from "./abis/erc20";

export class ERC20Token extends EventEmitter {
  logger: Logger;
  blockchainClient: BlockchainClient;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: BigNumber;
  contract: any;
  userAddress: string | undefined;
  userBalance: BigNumber;
  formatDecimals: number;
  allowance: { [address: string]: BigNumber };
  approvalPending: { [address: string]: boolean };

  get logPrefix() {
    return `erc20Token-${this.name}`;
  }

  constructor(blockchainClient: BlockchainClient, address: string, logger?: Logger) {
    super();
    this.setMaxListeners(0);
    this.logger = logger ? logger : new Logger();

    this.blockchainClient = blockchainClient;
    this.address = address;
    this.name = "";
    this.symbol = "";
    this.userAddress = undefined;
    this.userBalance = new BigNumber(0);
    this.totalSupply = new BigNumber(0);
    this.decimals = 18;
    this.formatDecimals = 2;
    this.allowance = {};
    this.approvalPending = {};
  }

  async init() {
    this.contract = this.blockchainClient.getContract(this.address, ERC20ABI as  web3Utils.AbiItem[]);
    this.decimals = parseInt(await this.contract.methods.decimals().call());
    this.name = await this.contract.methods.name().call();
    this.symbol = await this.contract.methods.symbol().call();
    if (this.blockchainClient.account) {
      this.userAddress = this.blockchainClient.account.address;
      await this.updateBalance();
    } else {
      this.totalSupply = shiftedBigNumber(
        await this.contract.methods.totalSupply().call(),
        this.decimals
      );  
    }
    // await this.syncAllowances(Object.keys(this.allowance));
    // this.emit(events.updated);

    // init log
    this.logger.log(this.logPrefix, 'info', 'init');
  }

  async syncAllowances(addresses: string[]) {
    let allowance: { [key: string]: BigNumber } = {};
    let approvalPending: { [key: string]: boolean } = {};
    for (let address of addresses) {
      allowance[address] = await this.fetchAllowance(address);
      approvalPending[address] = this.approvalPending[address] || false;
    }
    this.allowance = allowance;
    this.approvalPending = approvalPending;
    this.emit(events.updated);
  }

  async fetchAllowance(address: string) {
    return shiftedBigNumber(
      await this.contract.methods.allowance(this.userAddress, address).call(),
      this.decimals
    );
  }

  setApprovalPending(address: string, isPending = true) {
    this.approvalPending[address] = isPending;
    this.emit(events.updated);
  }

  async updateBalance() {
    this.userBalance = shiftedBigNumber(
      await this.contract.methods.balanceOf(this.userAddress).call(),
      this.decimals
    );
    this.totalSupply = shiftedBigNumber(
      await this.contract.methods.totalSupply().call(),
      this.decimals
    );
  }

  formattedBalance() {
    return formatNumber(this.userBalance, this.formatDecimals);
  }

  async sync() {
    await this.updateBalance();
    this.emit(events.updated);
  }

  approve(address: string, amount?: BigNumber) {
    const formattedAmount = amount
      ? smallToBig(amount, this.decimals)
      : MAX_NUM;
    return this.contract.methods.approve(address, formattedAmount);
  }

  transfer(address: string, amount: BigNumber) {
    const formattedAmount = smallToBig(amount, this.decimals);
    return this.contract.methods.transfer(address, formattedAmount);
  }
}
