import { EventEmitter } from "events";
import config from "../config";
import {
  BlockchainClient, IStoredUser,
  IStoredBlockchain, IStoredNode, IStoredWallet,
  IStoredTokenCreator,
  Logger, waitFor,
  mongoDB, Response,
  STATUS_SUCCESS,
  IStoredToken,
} from "@torobot/shared";
import BigNumber from "bignumber.js";
import tokenCreatorABI from "./tokenCreator";
import tokenABI from "./token";
import erc20ABI from "../scan/erc20";
import routerABI from "./uniswapV2Router";
import * as web3Utils from "web3-utils";

export class TokenCreatorBotClient extends EventEmitter {

  logger: Logger;
  bot: IStoredTokenCreator;
  blockchain: IStoredBlockchain;
  node: IStoredNode;
  wallet: IStoredWallet;
  blockchainClient: BlockchainClient;


  get logPrefix() {
    return `tokenCreatorbotClient`;
  }

  constructor(bot: IStoredTokenCreator) {
    super();
    this.setMaxListeners(0);
    this.logger = new Logger(config.LOG_DIR_PATH + `/tokenCreatorbot/${bot._id}.txt`);

    this.bot = bot;
  }

  async init() {
    this.blockchain = this.bot.blockchain as IStoredBlockchain;
    this.node = this.bot.node as IStoredNode;
    this.wallet = this.bot.wallet as IStoredWallet;
    this.blockchainClient = new BlockchainClient(this.blockchain, this.node, this.wallet as IStoredWallet, this.logger);
    await this.blockchainClient.init();
    this.logger.log(this.logPrefix, 'info', 'init');
  }

  getTokenCreatorAddress(blockchainName: string) {
    if (blockchainName === "Binance") {
      return "0xa3Ab2689bb0380FDaf67E3BB6A15063d5B04Ce06";
    } else if (blockchainName === "Polygon") {
      return "0x9aB4c17EE3bBb534B1e6B1D9404731682BAbE8F6";
    } else if (blockchainName === "Harmony") {
      return "0x15cE3bc11446897D75D9060eA4F7C64a73Bb8a12";
    } else if (blockchainName === "Fantom") {
      return "0x64f162826e76cd89c65d6d658151744663D459cf";
    } else if (blockchainName === "Avalanche") {
      return "0x6E0648e873843d2d78958A9Ee1fcadfd1Ec8d39f";
    } else {
      return "";
    }
  }
  async create() {
    let botDoc = await mongoDB.TokenCreators.findById(this.bot._id);
    try {
      botDoc.state = {
        action: 'Token Creating',
        result: ''
      }
      await botDoc.save();
    } catch (e) {
      console.log(e);
    }
    const tokenCreatorAddress = this.getTokenCreatorAddress(this.blockchain.name);
    if (tokenCreatorAddress.length > 0) {
      try {
        const tokenCreatorContract = new this.blockchainClient.rpcWeb3.eth.Contract(tokenCreatorABI as web3Utils.AbiItem[], tokenCreatorAddress);
        const gasPrice = await this.blockchainClient.rpcWeb3.eth.getGasPrice();
        const txCall = tokenCreatorContract.methods.createErc20Token(
          this.bot.name,
          this.bot.symbol,
          this.bot.decimals,
          this.bot.maxSupply,
        );
        const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
          this.wallet.publicKey,
          this.wallet.privateKey,
          tokenCreatorAddress,
          txCall,
          0,
          new BigNumber(Number(gasPrice)).multipliedBy(1.5).toFixed(0)
        );
        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `token created: transactionHash(${txRes.data.transactionHash})`);
          let tokenResult = "";
          for (let i = 0; i < txRes.data.logs.length; i++) {
            if (txRes.data.logs[i].topics[0] === "0x2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d") {
              tokenResult = txRes.data.logs[i].address;
            }
          }
          if (tokenResult !== "") {
            console.log("=========>tokenAddress: ", tokenResult);

            const tokenObj = await mongoDB.Tokens.create({
              address: tokenResult,
              name: this.bot.name,
              symbol: this.bot.symbol,
              decimals: this.bot.decimals,
              totalSupply: 0,
              blockchain: this.blockchain._id
            });
            botDoc.token = tokenObj._id;
            botDoc.state = { action: 'Token Creating', result: 'Success' };
            await botDoc.save();
          } else {
            botDoc.state = { action: 'Token Creating', result: 'Failed' };
            await botDoc.save();
          }
        } else {
          botDoc.state = { action: 'Token Creating', result: 'Failed' };
          await botDoc.save();
        }
      } catch (e) {
        console.warn("---------Token creating: ", e);
        botDoc.state = { action: 'Token Creating', result: 'Failed' };
        await botDoc.save();
      }
      await this.waitOneBlock();
    } else {
      botDoc.state = { action: 'Token Creating', result: 'Failed' };
      await botDoc.save();
    }

  }

  async tokenMint(amount: string) {
    console.log("token Minting---->", amount, this.bot.token);
    let botDoc = await mongoDB.TokenCreators.findById(this.bot._id);
    botDoc.state = { action: 'Minting', result: '' }
    await botDoc.save();
    if (this.bot.token) {
      try {
        const token = this.bot.token as IStoredToken;
        const tokenContract = new this.blockchainClient.rpcWeb3.eth.Contract(tokenABI as web3Utils.AbiItem[], token.address);
        const gasPrice = await this.blockchainClient.rpcWeb3.eth.getGasPrice();
        const txCall = tokenContract.methods.mint(this.wallet.publicKey, new BigNumber(amount).shiftedBy(token.decimals));
        const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
          this.wallet.publicKey,
          this.wallet.privateKey,
          token.address,
          txCall,
          0,
          new BigNumber(Number(gasPrice)).multipliedBy(1.5).toFixed(0)
        );
        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `token mint: transactionHash(${txRes.data.transactionHash})`);
          botDoc.state = { action: 'Minting', result: 'Success' }
          await botDoc.save();
          const transactionDoc = await mongoDB.TokenMintBurnTransaction.create({
            tokenCreator: this.bot._id,
            date: new Date(),
            type: "MINT",
            amount: amount,
            txHash: txRes.data.transactionHash,
          })
          await transactionDoc.save();
        } else {
          botDoc.state = { action: 'Minting', result: 'Failed' }
          await botDoc.save();
        }
      } catch (err) {
        console.log(err);
        botDoc.state = { action: 'Minting', result: 'Failed' }
        await botDoc.save();
      }
    } else {
      botDoc.state = { action: 'Minting', result: 'Failed' }
      await botDoc.save();
    }
  }

  async tokenBurn(amount: string) {
    console.log("token Burning---->", amount);
    let botDoc = await mongoDB.TokenCreators.findById(this.bot._id);
    botDoc.state = { action: 'Burning', result: '' }
    await botDoc.save();
    if (this.bot.token) {
      try {
        const token = this.bot.token as IStoredToken;
        const tokenContract = new this.blockchainClient.rpcWeb3.eth.Contract(tokenABI as web3Utils.AbiItem[], token.address);
        const gasPrice = await this.blockchainClient.rpcWeb3.eth.getGasPrice();
        const txCall = tokenContract.methods.burn(this.wallet.publicKey, new BigNumber(amount).shiftedBy(token.decimals));
        const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
          this.wallet.publicKey,
          this.wallet.privateKey,
          token.address,
          txCall,
          0,
          new BigNumber(Number(gasPrice)).multipliedBy(1.5).toFixed(0)
        );

        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `token burn: transactionHash(${txRes.data.transactionHash})`);
          botDoc.state = { action: 'Burning', result: 'Success' }
          await botDoc.save();
          const transactionDoc = await mongoDB.TokenMintBurnTransaction.create({
            tokenCreator: this.bot._id,
            date: new Date(),
            type: "BURN",
            amount: amount,
            txHash: txRes.data.transactionHash,
          })
          await transactionDoc.save();
        } else {
          console.log("toro----------->Failed", txRes);
          botDoc.state = { action: 'Burning', result: 'Failed' }
          await botDoc.save();    
        }
      } catch (err) {
        console.log("toro---------->error", err);
        botDoc.state = { action: 'Burning', result: 'Failed' }
        await botDoc.save();
      }
    } else {
      botDoc.state = { action: 'Burning', result: 'Failed' }
      await botDoc.save();
    }
  }

  async addLP(baseCoinAddress: string, baseCoinAmount: string, tokenAmount: string, dexId: string) {
    console.log("adding lp---->", baseCoinAddress, baseCoinAmount, tokenAmount, dexId);
    let botDoc = await mongoDB.TokenCreators.findById(this.bot._id);
    const gasPrice = await this.blockchainClient.rpcWeb3.eth.getGasPrice();
    const token = this.bot.token as IStoredToken;
    let dexDoc = await mongoDB.Dexes.findById(dexId);
    const coinContract = new this.blockchainClient.rpcWeb3.eth.Contract(erc20ABI as web3Utils.AbiItem[], baseCoinAddress);
    const coinSymbol = await coinContract.methods.symbol().call();
    const coinDecimals = await coinContract.methods.decimals().call();
    const tokenContract = new this.blockchainClient.rpcWeb3.eth.Contract(tokenABI as web3Utils.AbiItem[], token.address);
    const routerContract = new this.blockchainClient.rpcWeb3.eth.Contract(routerABI as web3Utils.AbiItem[], dexDoc.routerAddress);

    try {
      // 1. baseCoin Approving for addLiquidity
      const txCall1 = coinContract.methods.approve(dexDoc.routerAddress, baseCoinAmount);
      const txRes1: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
        this.wallet.publicKey,
        this.wallet.privateKey,
        baseCoinAddress,
        txCall1,
        0,
        new BigNumber(Number(gasPrice)).multipliedBy(1.5).toFixed(0)
      );
      if (txRes1.status === STATUS_SUCCESS) {
        this.logger.log(this.logPrefix, 'info', `1------>baseCoin Approved for addLiquidity: transactionHash(${txRes1.data.transactionHash})`);
        await this.waitOneBlock();
        // 2. token Approving for addLiquidity
        const txCall2 = tokenContract.methods.approve(dexDoc.routerAddress, tokenAmount);
        const txRes2: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
          this.wallet.publicKey,
          this.wallet.privateKey,
          token.address,
          txCall2,
          0,
          new BigNumber(Number(gasPrice)).multipliedBy(1.5).toFixed(0)
        );
        if (txRes2.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `2------->token Approved for addLiquidity: transactionHash(${txRes2.data.transactionHash})`);
          await this.waitOneBlock();
          // 3. add liquidity
          let txCall3;
          if (new BigNumber(baseCoinAddress.toLowerCase()).isLessThan(new BigNumber(token.address.toLowerCase()))) {
            txCall3 = routerContract.methods.addLiquidity(
              baseCoinAddress,
              token.address,
              baseCoinAmount,
              tokenAmount,
              0,
              0,
              this.wallet.publicKey,
              Date.now() + 1000 * 60 * 5
            );
          } else {
            txCall3 = routerContract.methods.addLiquidity(
              token.address,
              baseCoinAddress,
              tokenAmount,
              baseCoinAmount,
              0,
              0,
              this.wallet.publicKey,
              Date.now() + 1000 * 60 * 5
            );
          }
          const txRes3: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
            this.wallet.publicKey,
            this.wallet.privateKey,
            dexDoc.routerAddress,
            txCall3,
            0,
            new BigNumber(Number(gasPrice)).multipliedBy(1.5).toFixed(0),
            6000000
          );
          if (txRes3.status === STATUS_SUCCESS) {
            this.logger.log(this.logPrefix, 'info', `3------->addLiquidity: transactionHash(${txRes3.data.transactionHash})`);
            await this.waitOneBlock();
            botDoc.state = { action: 'Adding LP', result: 'Success' }
            await botDoc.save();
            const res = await this.blockchainClient.rpcWeb3.eth.getTransactionReceipt(txRes3.data.transactionHash);
            let SentBaseCoinAmount = '0';
            let SentTokenAmount = '0';
            for (const log of res.logs) {
              if (log.topics[0] == '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f' && log.topics[1] &&
                log.topics[1]?.substring(26).toLowerCase() == dexDoc.routerAddress.substring(2).toLowerCase()) {
                if (new BigNumber(baseCoinAddress.toLowerCase()).isGreaterThan(new BigNumber(token.address.toLowerCase()))) {
                  SentBaseCoinAmount = new BigNumber('0x' + log.data.substring(66, 130)).shiftedBy(-Number(coinDecimals)).toFixed(Number(coinDecimals));
                  SentTokenAmount = new BigNumber(log.data.substring(0, 66)).shiftedBy(-Number(token.decimals || '')).toFixed(Number(token.decimals));
                } else {
                  SentBaseCoinAmount = new BigNumber(log.data.substring(0, 66)).shiftedBy(-Number(coinDecimals)).toFixed(Number(coinDecimals));
                  SentTokenAmount = new BigNumber('0x' + log.data.substring(66, 130)).shiftedBy(-Number(token.decimals || '')).toFixed(Number(token.decimals));
                }
                break;
              }
              // if (log.topics[0] == "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef") {
              //   if (log.topics[2].substring(26).toLowerCase() == this.wallet.publicKey.toLowerCase()) {
              //     if (log.address.toLowerCase() == baseCoinAddress.toLowerCase()) {
              //       ReceivedBaseCoinAmount = new BigNumber(log.data).shiftedBy(-Number(coinDecimals)).toFixed(Number(coinDecimals));
              //     }
              //     if (log.address.toLowerCase() == token.address.toLowerCase()) {
              //       ReceivedTokenAmount = new BigNumber(log.data).shiftedBy(-Number(token.decimals || '')).toFixed(Number(token.decimals));
              //     }
              //   }
              // }
            }
            const transactionDoc = await mongoDB.LiquidityPoolTransaction.create({
              tokenCreator: this.bot._id,
              date: new Date(),
              type: "ADD_LP",
              dex: dexId,
              baseCoin: {
                symbol: coinSymbol,
                amount: SentBaseCoinAmount,
              },
              token: {
                symbol: token.symbol,
                amount: SentTokenAmount
              },
              txHash: txRes3.data.transactionHash,
            })
            await transactionDoc.save();
            return;
          }
        }
      }
    } catch (err) {
      console.log(err);
    }

    botDoc.state = { action: 'Adding LP', result: 'Failed' }
    await botDoc.save();
  }

  async removeLP(baseCoinAddress: string, lpAddress: string, lpAmount: string, dexId: string) {
    console.log("removing lp---->", baseCoinAddress, lpAmount, dexId);
    let botDoc = await mongoDB.TokenCreators.findById(this.bot._id);
    try {
      const gasPrice = await this.blockchainClient.rpcWeb3.eth.getGasPrice();
      const token = this.bot.token as IStoredToken;
      let dexDoc = await mongoDB.Dexes.findById(dexId);
      const routerContract = new this.blockchainClient.rpcWeb3.eth.Contract(routerABI as web3Utils.AbiItem[], dexDoc.routerAddress);
      const pairContract = new this.blockchainClient.rpcWeb3.eth.Contract(erc20ABI as web3Utils.AbiItem[], lpAddress);

      const coinContract = new this.blockchainClient.rpcWeb3.eth.Contract(erc20ABI as web3Utils.AbiItem[], baseCoinAddress);
      const coinSymbol = await coinContract.methods.symbol().call();
      const coinDecimals = await coinContract.methods.decimals().call();
      // 1. baseCoin Approving for addLiquidity
      const txCall1 = pairContract.methods.approve(dexDoc.routerAddress, lpAmount);
      const txRes1: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
        this.wallet.publicKey,
        this.wallet.privateKey,
        lpAddress,
        txCall1,
        0,
        new BigNumber(Number(gasPrice)).multipliedBy(1.5).toFixed(0)
      );
      if (txRes1.status === STATUS_SUCCESS) {
        this.logger.log(this.logPrefix, 'info', `1------>baseCoin Approved for remove Liquidity: transactionHash(${txRes1.data.transactionHash})`);
        await this.waitOneBlock();
        let txCall3;
        if (new BigNumber(baseCoinAddress.toLowerCase()).isLessThan(new BigNumber(token.address.toLowerCase()))) {
          txCall3 = routerContract.methods.removeLiquidity(
            baseCoinAddress,
            token.address,
            lpAmount,
            0,
            0,
            this.wallet.publicKey,
            Date.now() + 1000 * 60 * 5
          );
        } else {
          txCall3 = routerContract.methods.removeLiquidity(
            token.address,
            baseCoinAddress,
            lpAmount,
            0,
            0,
            this.wallet.publicKey,
            Date.now() + 1000 * 60 * 5
          );
        }
        const txRes3: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
          this.wallet.publicKey,
          this.wallet.privateKey,
          dexDoc.routerAddress,
          txCall3,
          0,
          new BigNumber(Number(gasPrice)).multipliedBy(1.5).toFixed(0),
          6000000
        );
        if (txRes3.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `0------->removeLiquidity: transactionHash(${txRes3.data.transactionHash})`);
          await this.waitOneBlock();
          botDoc.state = { action: 'Removing LP', result: 'Success' }
          await botDoc.save();
          const res = await this.blockchainClient.rpcWeb3.eth.getTransactionReceipt(txRes3.data.transactionHash);
          let ReceivedBaseCoinAmount = '0';
          let ReceivedTokenAmount = '0';
          for (const log of res.logs) {
            if (log.topics[0] == '0xdccd412f0b1252819cb1fd330b93224ca42612892bb3f4f789976e6d81936496' && log.topics[1] &&
              log.topics[1]?.substring(26).toLowerCase() == dexDoc.routerAddress.substring(2).toLowerCase()) {
              if (new BigNumber(baseCoinAddress.toLowerCase()).isGreaterThan(new BigNumber(token.address.toLowerCase()))) {
                ReceivedBaseCoinAmount = new BigNumber('0x' + log.data.substring(66, 130)).shiftedBy(-Number(coinDecimals)).toFixed(Number(coinDecimals));
                ReceivedTokenAmount = new BigNumber(log.data.substring(0, 66)).shiftedBy(-Number(token.decimals || '')).toFixed(Number(token.decimals));
              } else {
                ReceivedBaseCoinAmount = new BigNumber(log.data.substring(0, 66)).shiftedBy(-Number(coinDecimals)).toFixed(Number(coinDecimals));
                ReceivedTokenAmount = new BigNumber('0x' + log.data.substring(66, 130)).shiftedBy(-Number(token.decimals || '')).toFixed(Number(token.decimals));
              }
              break;
            }
          }
          const transactionDoc = await mongoDB.LiquidityPoolTransaction.create({
            tokenCreator: this.bot._id,
            date: new Date(),
            type: "REMOVE_LP",
            dex: dexId,
            baseCoin: {
              symbol: coinSymbol,
              amount: ReceivedBaseCoinAmount,
            },
            token: {
              symbol: token.symbol,
              amount: ReceivedTokenAmount
            },
            txHash: txRes3.data.transactionHash,
          })
          await transactionDoc.save();

          return;
        }
      }
    } catch (e) {
      console.log(e)
    }
    botDoc.state = { action: 'Removing LP', result: 'Failed' }
    await botDoc.save();
  }

  async waitOneBlock() {
    let _startBlockNumber = await this.blockchainClient.rpcWeb3.eth.getBlockNumber();
    let _currentBlockNumber = _startBlockNumber;
    while (_currentBlockNumber <= _startBlockNumber + 2) {
      _currentBlockNumber = await this.blockchainClient.rpcWeb3.eth.getBlockNumber();
      await waitFor(1000);
    }
  }
}
