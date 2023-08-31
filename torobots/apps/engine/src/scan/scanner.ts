import { EventEmitter } from "events";
import Web3 from "web3";
import erc20ABI from "./erc20";
import factoryABI from "./factory";
import * as web3Utils from "web3-utils";
import BigNumber from "bignumber.js";
import {
  ERC20Token,
  Logger,
  IStoredBlockchain,
  IStoredNode,
  IStoredDex,
  mongoDB,
  IPool,
  ICoin,
  ISocketData,
  ESocketType
} from "@torobot/shared";

export class Scanner extends EventEmitter {
  logger: Logger;
  blockchain: IStoredBlockchain;
  node: IStoredNode;
  dex: IStoredDex;
  coinAddress: string[];
  tokenAddress: string;

  coinERC20: ERC20Token;
  tokenERC20: ERC20Token;
  rpcWeb3: Web3;
  lock: boolean = false;
  currentBlockNumber: number = 0;
  count: number = 0;
  factoryContract: any;
  private intervalID = null;

  get logPrefix() {
    return `scannerThread-`;
  }

  constructor(node: IStoredNode, dex: IStoredDex) {
    super();
    this.blockchain = dex.blockchain as IStoredBlockchain;
    this.node = node;
    this.dex = dex;
    this.rpcWeb3 = new Web3(this.node.rpcProviderURL);
    this.factoryContract = new this.rpcWeb3.eth.Contract(factoryABI as web3Utils.AbiItem[], this.dex.factoryAddress);
  }

  start() {
    console.log("started scanner: ", this.blockchain.name, this.node.name, this.dex.name);
    this.intervalID = setInterval(() => this.process(), 2000);
  }

  async process() {
    if (!this.rpcWeb3) {
      return;
    }
    this.count++;
    if (this.blockchain.name === "Aurora" && this.count % 10 > 0) {
      return;
    }
    // console.log("count: ", this.count, this.blockchain.name, this.node.rpcProviderURL);
    if (this.lock) { return; }
    this.lock = true;
    try {
      const _currentBlockNumber = await this.rpcWeb3.eth.getBlockNumber();
      if (this.currentBlockNumber === 0) {
        this.currentBlockNumber = _currentBlockNumber;
        this.lock = false;
        return;
      }
      if (_currentBlockNumber > this.currentBlockNumber) {

        const _events = await this.factoryContract.getPastEvents('PairCreated', { fromBlock: this.currentBlockNumber + 1, toBlock: _currentBlockNumber });
        for (const _event of _events) {
          const token0Contract = new this.rpcWeb3.eth.Contract(erc20ABI as web3Utils.AbiItem[], _event.returnValues.token0);
          const token0Symbol = await token0Contract.methods.symbol().call();
          const token1Contract = new this.rpcWeb3.eth.Contract(erc20ABI as web3Utils.AbiItem[], _event.returnValues.token1);
          const token1Symbol = await token1Contract.methods.symbol().call();
          // const txData = await this.rpcWeb3.eth.getTransaction(_event.transactionHash);
          const txData = await this.rpcWeb3.eth.getTransactionReceipt(_event.transactionHash);
          const timestamp = (await this.rpcWeb3.eth.getBlock(_event.blockNumber)).timestamp;
          let t: IPool = {
            token1: { address: _event.returnValues.token0, symbol: token0Symbol },
            token2: { address: _event.returnValues.token1, symbol: token1Symbol },
            pairAddress: _event.returnValues.pair,
            blockNumber: _event.blockNumber,
            count: _event.returnValues['3'],
            transactionHash: _event.transactionHash,
            createdTime: new Date(Number(timestamp) * 1000),
            dex: this.dex,
            blockchain: this.blockchain,
            amount1: 0,
            amount2: 0
          };
          if (txData) {
            txData.logs.map(r => {
              if (r.topics.includes('0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f')) {
                t.amount1 = Number(r.data.substr(0, 66));
                t.amount2 = Number('0x' + r.data.substr(66, 64));
                // console.log('txData: ', txData);
              }
            })
          }
          const coin0 = await this.getCoin(_event.returnValues.token0);
          if (coin0) {
            t = {
              ...t,
              size: new BigNumber(t.amount1).multipliedBy(coin0.price).shiftedBy(-coin0.decimals).toNumber()
            }
          } else {
            const coin1 = await this.getCoin(_event.returnValues.token1);
            if (coin1) {
              t = {
                ...t,
                token1: t.token2,
                token2: t.token1,
                amount1: t.amount2,
                amount2: t.amount1,
                size: new BigNumber(t.amount2).multipliedBy(coin1.price).shiftedBy(-coin1.decimals).toNumber()
              }
            } else {
              t = {
                ...t,
                size: 0
              }
            }
          }

          if (t.size > 0) {
            const sequenceDocument = await mongoDB.Counters.findOneAndUpdate(
              {'sequenceName': 'Pool'},
              { $inc: {sequenceValue: 1} },
              { new: true, upsert: true }
            );
            mongoDB.Pools.create({...t, uniqueNum: sequenceDocument.sequenceValue});
            // removed websocket
            // const socketData: ISocketData = {
            //   type: ESocketType.NEW_TOKEN_DROPPED,
            //   data: t
            // };
            
            // this.wsServer.clients.forEach(client => {
            //   client.send(JSON.stringify(socketData));
            // });
          }
        }
        this.currentBlockNumber = _currentBlockNumber;
      }
    } catch (e) {
      // console.log("count: ", this.count, this.blockchain.name, this.node.rpcProviderURL, e);
    }
    this.lock = false;
  }

  async getCoin(address: string): Promise<ICoin> {
    return mongoDB.Coins.findOne({
      blockchain: this.blockchain._id,
      address: {$regex: new RegExp(address, "i")}
    });
  }
}