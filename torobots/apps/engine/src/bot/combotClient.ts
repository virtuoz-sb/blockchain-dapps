import { EventEmitter } from "events";
import WebSocket from "ws";

import config from "../config";
import { getMaxGasPriceByBlockchainName } from "../scan";
import {
  BlockchainClient, ERC20Token, UniswapDex,
  IStoredUser, IStoredAutoBot, IStoredBlockchain, IStoredNode, IStoredDex, IStoredWallet, IStoredCoin, IStoredToken, ITransaction,
  ERunningStatus, ETradingThread, ETradingInitiator, EBotBuyType, EBotSellType, events,
  STATUS_READY, STATUS_SUCCESS,
  Logger, waitFor,
  Response, mongoDB, IAutoBotState, ISocketData, ESocketType
} from "@torobot/shared";
import BigNumber from "bignumber.js";
export class ComBotClient extends EventEmitter {
  step: number = 0;
  tryCount: number = 0;
  lock: boolean = false;
  state: IAutoBotState = {
    active: false,
    status: ERunningStatus.DRAFT,
    thread: 'NONE'
  }
  processed: boolean = false;
  logger: Logger;
  user: IStoredUser;
  bot: IStoredAutoBot;
  blockchain: IStoredBlockchain;
  node: IStoredNode;
  dex: IStoredDex;
  wallet: IStoredWallet;
  coin: IStoredCoin;
  token: IStoredToken;

  coinAddress: string;
  tokenAddress: string;
  walletAddress: string;
  walletKey: string;

  blockchainClient: BlockchainClient;
  swapDex: UniswapDex;
  coinERC20: ERC20Token;
  tokenERC20: ERC20Token;

  transaction: ITransaction;

  private intervalID = null;
  private wsServer: WebSocket.Server;

  get logPrefix() {
    return `autobotClient`;
  }

  constructor(bot: IStoredAutoBot, wsServer: WebSocket.Server) {
    super();
    this.setMaxListeners(0);
    this.logger = new Logger(config.LOG_DIR_PATH + `/autobot/${bot._id}.txt`);

    this.bot = bot;
    this.wsServer = wsServer;
  }

  async init() {
    this.user = this.bot.owner as IStoredUser;
    this.blockchain = this.bot.blockchain as IStoredBlockchain;
    this.node = this.bot.node as IStoredNode;
    this.dex = this.bot.dex as IStoredDex;
    this.wallet = this.bot.mainWallet as IStoredWallet;
    this.coin = this.bot.coin as IStoredCoin;
    this.token = this.bot.token as IStoredToken;
    this.coinAddress = this.coin.address;
    this.tokenAddress = this.token.address;

    this.blockchainClient = new BlockchainClient(this.blockchain, this.node, this.wallet as IStoredWallet, this.logger);
    this.swapDex = new UniswapDex(this.blockchainClient, this.dex, this.logger);
    this.coinERC20 = new ERC20Token(this.blockchainClient, this.coinAddress, this.logger);
    this.tokenERC20 = new ERC20Token(this.blockchainClient, this.tokenAddress, this.logger);

    await this.blockchainClient.init();
    await this.swapDex.init();
    await this.coinERC20.init();
    await this.tokenERC20.init();
    if (!this.bot.walletAddress && !this.bot.walletKey) {
      const newAccount = await this.blockchainClient.rpcWeb3.eth.accounts.create(new Date().toString());
      this.walletAddress = newAccount.address;
      this.walletKey = newAccount.privateKey;
      // save the new walletAddress and walletKey on Database.
      this.bot.walletAddress = this.walletAddress;
      this.bot.walletKey = this.walletKey;
      const botDoc = await mongoDB.AutoBots.findById(this.bot._id);
      botDoc.walletAddress = this.walletAddress;
      botDoc.walletKey = this.walletKey;
      botDoc.save();
    } else {
      this.walletAddress = this.bot.walletAddress;
      this.walletKey = this.bot.walletKey;
    }

    this.logger.log(this.logPrefix, 'info', 'init');
  }

  sendBotState(wsData: ISocketData) {
    this.wsServer.clients.forEach(client => {
      client.send(JSON.stringify(wsData));
    });
  }

  setState(st: IAutoBotState) {
    this.state = st;
    this.bot.state = st;

    this.sendBotState({
      type: ESocketType.AUTO_BOT_STATE,
      data: this.bot
    });
  }

  start() {
    this.setState({
      active: true,
      status: ERunningStatus.RUNNING
    });
    this.processed = false;
    this.step = 0; // from db
    this.tryCount = 0;
    this.lock = false;
    this.intervalID = setInterval(() => this.process(), 1000);
  }

  stop() {
    this.setState({
      active: false,
      status: ERunningStatus.FAILED
    });

    if (this.intervalID) {
      clearInterval(this.intervalID);
    }
  }

  async process() {
    if (!this.state.active) {
      return;
    }
    if (this.processed && this.intervalID) {
      clearInterval(this.intervalID);
      return;
    }

    if (this.lock) {
      return;
    }
    console.log(`lock(${this.lock}), tryCount(${this.tryCount}), step(${this.step})`);
    this.lock = true;
    this.tryCount++;
    const gasPrice = new BigNumber(getMaxGasPriceByBlockchainName(this.blockchain.name)).shiftedBy(9).toString();
    if (this.step === 0) {
      // 0. sending main network coin from mainWallet to walletAddress
      try {
        const tx = await this.blockchainClient.rpcWeb3.eth.accounts.signTransaction(
          {
            to: this.walletAddress,
            value: new BigNumber(this.blockchain.amountForFee).shiftedBy(18).toString(),
            gas: 2000000,
            gasPrice: gasPrice
          },
          this.wallet.privateKey
        );
        if (tx && tx?.rawTransaction) {
          const sendResult = await this.blockchainClient.rpcWeb3.eth.sendSignedTransaction(tx.rawTransaction);
          if (sendResult && sendResult?.status) {
            // emit this succeed status
            this.setState({
              active: true,
              status: ERunningStatus.RUNNING,
              thread: "step0 success"
            });
            console.log("step 0 succeed", sendResult);
            this.step++;
            this.tryCount = 0;
          }
        }
      } catch (e) {
        console.warn("step0: ", e);
        // emit this failed status
      }
    } else if (this.step === 1) {
      // 1. sending base token for buying from mainWallet to walletAddress
      try {
        console.log(`wallet(${this.walletAddress}), buyAmount(${this.bot.buyAmount}), coin(${this.coinERC20.symbol}, ${this.coinERC20.decimals})`)
        const txCall = this.coinERC20.transfer(this.walletAddress, new BigNumber(this.bot.buyAmount));
        const txRes: Response = await this.blockchainClient.sendSignedTransaction(this.coinERC20.address, txCall, 0, gasPrice);
        console.log("step1: ", txRes);
        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `sending: transactionHash(${txRes.data.transactionHash})`);
          // emit this succeed status
          this.setState({
            active: true,
            status: ERunningStatus.RUNNING,
            thread: "step1 success"
          });
          this.step++;
          console.log("step 1 succeed", txRes);
          this.tryCount = 0;
        }
      } catch (e) {
        console.warn("step1: ", e);
      }
    } else if (this.step === 2) {
      // 2. approving for pre buying
      try {
        const txCall = this.coinERC20.approve(this.dex.routerAddress, new BigNumber(this.bot.buyAmount / 10000));
        const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(this.walletAddress, this.walletKey, this.coinERC20.address, txCall, 0, gasPrice);
        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `approving-for pre buying: transactionHash(${txRes.data.transactionHash})`);
          this.setState({
            active: true,
            status: ERunningStatus.RUNNING,
            thread: "step 2 success"
          });
          this.step++;
          this.tryCount = 0;
          console.log("step 2 succeed", txRes);
        }
      } catch (e) {
        console.warn("step2: ", e)
      }
    } else if (this.step === 3) {
      // 3. pre buying
      try {
        const inAmount = new BigNumber(this.bot.buyAmount).shiftedBy(this.coinERC20.decimals - 4).toString();
        console.log(`step3 : inAmount(${inAmount}), wallet(${this.walletAddress}, ${this.walletKey}), dex(${this.dex.routerAddress}), gasPrice(${gasPrice})`);
        const txCall = await this.swapDex.buyToken(this.coinAddress, this.tokenAddress, inAmount, this.walletAddress);
        const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(this.walletAddress, this.walletKey, this.dex.routerAddress, txCall, 0, gasPrice);
        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `pre buying: transactionHash(${txRes.data.transactionHash})`);

          this.setState({
            active: true,
            status: ERunningStatus.RUNNING,
            thread: "step3 success"
          });
          await waitFor(3000);
          this.step++;
          this.tryCount = 0;
          console.log("step 3 succeed", txRes);
        }
      } catch (e) {
        console.warn("step3: ", e)
      }

    } else if (this.step === 4) {
      // 4. approving for pre selling
      try {
        const balance = await this.tokenERC20.contract.methods.balanceOf(this.walletAddress).call();
        console.log(`step 4: approve for pre sell: amount(${balance}), wallet(${this.walletAddress}) gasPrice(${gasPrice})`)
        const txCall = this.tokenERC20.approve(this.dex.routerAddress, new BigNumber(balance).shiftedBy(-this.tokenERC20.decimals));
        const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(this.walletAddress, this.walletKey, this.tokenERC20.address, txCall, 0, gasPrice);
        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `approving-for pre selling: transactionHash(${txRes.data.transactionHash})`);

          this.setState({
            active: true,
            status: ERunningStatus.RUNNING,
            thread: "step4 success"
          });
          this.step++;
          this.tryCount = 0;
          console.log("step 4 succeed", txRes);
        }
      } catch (e) {
        console.warn("step4: ", e)
      }

    } else if (this.step === 5) {
      // 5. pre selling
      try {
        const balance = await this.tokenERC20.contract.methods.balanceOf(this.walletAddress).call();
        console.log(`step 5: pre selling: amount(${balance}), wallet(${this.walletAddress}) gasPrice(${gasPrice})`)
        const txCall = await this.swapDex.sellToken(this.tokenAddress, this.coinAddress, balance, this.walletAddress);
        const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(this.walletAddress, this.walletKey, this.dex.routerAddress, txCall, 0, gasPrice);

        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `pre selling: transactionHash(${txRes.data.transactionHash})`);

          this.setState({
            active: true,
            status: ERunningStatus.RUNNING,
            thread: "step5 success"
          });
          this.step++;
          this.tryCount = 0;
          await waitFor(1000);
          console.log("step 5 succeed", txRes);
        }
      } catch (e) {
        console.warn("step5: ", e)
      }
    } else if (this.step === 6) {
      // 6. approving for main buying
      try {
        const buyAmount = await this.coinERC20.contract.methods.balanceOf(this.walletAddress).call();
        const inAmount = new BigNumber(buyAmount).shiftedBy(-this.coinERC20.decimals).toString();
        const txCall = this.coinERC20.approve(this.dex.routerAddress, new BigNumber(inAmount));
        const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(this.walletAddress, this.walletKey, this.coinERC20.address, txCall, 0, gasPrice);
        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `approving-for main buying: transactionHash(${txRes.data.transactionHash})`);
          this.step++;
          this.tryCount = 0;

          this.setState({
            active: true,
            status: ERunningStatus.RUNNING,
            thread: "step6 success"
          });
          console.log("step 6 succeed", txRes);
        }
      } catch (e) {
        console.warn("step6: ", e)
      }

    } else if (this.step === 7) {
      // 7. main buying
      try {
        const inAmount = await this.coinERC20.contract.methods.balanceOf(this.walletAddress).call();
        const txCall = await this.swapDex.buyToken(this.coinAddress, this.tokenAddress, inAmount, this.walletAddress);
        const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(this.walletAddress, this.walletKey, this.dex.routerAddress, txCall, 0, gasPrice);
        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `main buying: transactionHash(${txRes.data.transactionHash})`);
          this.step++;
          this.tryCount = 0;

          this.setState({
            active: true,
            status: ERunningStatus.RUNNING,
            thread: "step7 success"
          });
          console.log("step 7 succeed", txRes);
          await waitFor(3000);
        }
      } catch (e) {
        console.warn("step7: ", e)
      }

    } else if (this.step === 8) {
      // 8. approving for main selling
      try {
        const balance = await this.tokenERC20.contract.methods.balanceOf(this.walletAddress).call();
        console.log(`step 8: main selling approve: amount(${balance}), wallet(${this.walletAddress}) gasPrice(${gasPrice})`)
        const txCall = this.tokenERC20.approve(this.dex.routerAddress, new BigNumber(balance).shiftedBy(-this.tokenERC20.decimals));
        const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(this.walletAddress, this.walletKey, this.tokenERC20.address, txCall, 0, gasPrice);
        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `approving-for main selling: transactionHash(${txRes.data.transactionHash})`);
          this.step++;
          this.tryCount = 0;

          this.setState({
            active: true,
            status: ERunningStatus.RUNNING,
            thread: "step8 success"
          });

          console.log("step 8 succeed", txRes);
        }
      } catch (e) {
        console.warn("step4: ", e)
      }

    } else if (this.step === 9) {
      // 9. main selling
      try {
        const balance = await this.tokenERC20.contract.methods.balanceOf(this.walletAddress).call();
        console.log(`step 9: main selling: amount(${balance}), wallet(${this.walletAddress}) gasPrice(${gasPrice})`)
        const txCall = await this.swapDex.sellToken(this.tokenAddress, this.coinAddress, balance, this.walletAddress);
        const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(this.walletAddress, this.walletKey, this.dex.routerAddress, txCall, 0, gasPrice);

        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `main selling: transactionHash(${txRes.data.transactionHash})`);
          this.step++;
          this.tryCount = 0;

          this.setState({
            active: true,
            status: ERunningStatus.RUNNING,
            thread: "step9 success"
          });
          console.log("step 9 succeed", txRes);
        }
      } catch (e) {
        console.warn("step5: ", e)
      }
    } else if (this.step === 10) {
      // 10. finish !!!!
      console.log(`completed all the process !!!!!!!!!!!!`);
      this.setState({
        active: false,
        status: ERunningStatus.SUCCEEDED,
      });
      this.processed = true;
    }
    if (this.tryCount > 50) {
      this.processed = true;
      // status: Failed
    }
    this.lock = false;
  }
}
