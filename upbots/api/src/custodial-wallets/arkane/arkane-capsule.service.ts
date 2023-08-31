import { HttpService, Injectable, Inject, CACHE_MANAGER, Logger, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cache } from "cache-manager";
import { randomBytes } from "crypto";
import * as qs from "querystring";
import * as BN from "bn.js";
import { fromWei, toWei } from "web3-utils";

import CryptoCompareMultiPriceService from "../../cryptoprice/cryptocompare-multi-price.service";
import EtherscanService from "../etherscan/etherscan.service";

import {
  WalletDto,
  Chain,
  Wallet,
  GasFees,
  UbxtInfo,
  ErcToken,
  ArkaneWallet,
  ActionParams,
  GasReserveConfig,
  GetBearerTokenDto,
  BearerTokenResponse,
  WalletsResponse,
  UbxtPairResponse,
  TransactionStatus,
  TransactionRequest,
  TransactionResponse,
} from "./arkane.interfaces";

// TODO: make sure BN is used
// internally as much as possible
@Injectable()
export default class ArkaneCapsuleService {
  private readonly logger = new Logger(ArkaneCapsuleService.name);

  private readonly clientId = this.config.get("auth").clientId;

  private readonly secret = this.config.get("auth").secret;

  private readonly authHost = this.config.get("auth").host;

  private readonly grantType = this.config.get("auth").grantType;

  private readonly cacheKey = this.config.get("cacheKey");

  private readonly ubxtAddr = this.config.get("ubxt").eth;

  private readonly bubxtAddr = this.config.get("ubxt").bsc;

  private readonly pegAddr = this.config.get("ubxt").peg;

  private readonly gasReserve: GasReserveConfig = this.config.get("gasReserve");

  private credentials: GetBearerTokenDto = {
    grant_type: this.grantType,
    client_id: this.clientId,
    client_secret: this.secret,
  };

  constructor(
    private httpService: HttpService,
    private config: ConfigService,
    @Inject(CACHE_MANAGER) private cache: Cache,
    private pricing: CryptoCompareMultiPriceService,
    private etherscan: EtherscanService
  ) {
    this.httpService.axiosRef.interceptors.request.use(async (req) => {
      // prevents recursive request interception
      if (req.url === this.authHost) return req;

      try {
        let cached = await this.cache.get(this.config.get("cacheKey"));

        if (!cached) {
          const result = await this.getAccessToken(this.credentials);
          cached = await this.cacheAccessToken(result);
        }

        req.headers = { ...req.headers, Authorization: `Bearer ${cached}` };

        return req;
      } catch (e) {
        throw new InternalServerErrorException(`Failed to get Arkane API access token: ${e.message}`);
      }
    });
  }

  async findPair(identifier: WalletDto["identifier"]): Promise<WalletsResponse> {
    const res = await this.httpService.get("/wallets", { params: { identifier } }).toPromise();
    const { result } = res.data;

    if (result.length === 0) {
      throw new NotFoundException(`Pair not found: ${identifier}`);
    }

    const eth = result.find((w: ArkaneWallet) => w.secretType === "ETHEREUM") || null;
    const bsc = result.find((w: ArkaneWallet) => w.secretType === "BSC") || null;

    return [eth, bsc];
  }

  async createPair(identifier: WalletDto["identifier"], pincode: WalletDto["pincode"]): Promise<WalletsResponse> {
    const props = {
      identifier,
      pincode,
      walletType: <const>"WHITE_LABEL",
    };

    const eth = await this.create({ secretType: "ETHEREUM", ...props });
    const bsc = await this.create({ secretType: "BSC", ...props });

    return [eth.result, bsc.result];
  }

  async tokens(id: string) {
    const res = await this.httpService.get(`/wallets/${id}/balance/tokens`).toPromise();
    return res.data.result;
  }

  async token(id: string, address: string) {
    const res = await this.httpService.get(`/wallets/${id}/balance/tokens/${address}`).toPromise();
    return res.data.result;
  }

  async findUbxtPair(identifier: WalletDto["identifier"]): Promise<UbxtPairResponse> {
    const [walletEth, walletBsc] = await this.findPair(identifier);
    const ubxt = (await this.token(walletEth.id, this.ubxtAddr)) || this.emptyResponse(this.ubxtAddr);
    const bubxt = (await this.token(walletBsc.id, this.bubxtAddr)) || this.emptyResponse(this.bubxtAddr);

    return [
      {
        token: ubxt,
        wallet: walletEth,
      },
      {
        token: bubxt,
        wallet: walletBsc,
      },
    ];
  }

  generateCredentials() {
    return {
      identifier: randomBytes(10).toString("hex"),
      pincode: String(randomBytes(4).readUInt32BE()).slice(0, 6),
    };
  }

  generateNonce() {
    return String(randomBytes(32).readUInt32BE());
  }

  async claim(params: ActionParams) {
    return this.action({ action: "claim", ...params });
  }

  async waive(params: ActionParams) {
    const { ubx, pincode, amount } = params;

    await this.approvePeg(ubx, pincode, amount);
    return this.action({ action: "waive", ...params });
  }

  async transfer({ ubx, pincode, amount, to }: ActionParams): Promise<TransactionResponse> {
    const tx: TransactionRequest = {
      to: ubx.token.tokenAddress,
      type: "CONTRACT_EXECUTION",
      walletId: ubx.wallet.id,
      secretType: ubx.wallet.secretType,
      functionName: "transfer",
      inputs: [
        {
          type: "address",
          value: to,
        },
        {
          type: "uint256",
          value: amount,
        },
      ],
    };

    return this.execute(tx, pincode);
  }

  private async approvePeg(ubx: UbxtInfo<Chain>, pincode: string, allowance: string): Promise<TransactionResponse> {
    const tx: TransactionRequest = {
      to: ubx.token.tokenAddress,
      type: "CONTRACT_EXECUTION",
      walletId: ubx.wallet.id,
      secretType: ubx.wallet.secretType,
      functionName: "approve",
      inputs: [
        {
          type: "address",
          value: this.pegAddr,
        },
        {
          type: "uint256",
          value: allowance,
        },
      ],
    };

    return this.execute(tx, pincode);
  }

  // TODO: handle errors better
  private async execute(transactionRequest: TransactionRequest, pincode: string): Promise<TransactionResponse> {
    try {
      const res = await this.httpService.post("/transactions/execute", { transactionRequest, pincode }).toPromise();
      this.logger.log(`TX: ${transactionRequest.type} --> ${transactionRequest.to} (${transactionRequest.functionName || ""})`);
      const { transactionHash } = res.data.result;

      if (transactionHash) {
        return {
          transactionHash,
        };
      }

      throw new InternalServerErrorException(`No transaction hash found for ${transactionRequest.functionName} call`);
    } catch (err) {
      const errors = this.parseEvmErrors(err.response.data.errors);
      this.logger.warn(
        `Failed to execute transaction: ${transactionRequest.type} --> ${transactionRequest.to} (${transactionRequest.functionName})`
      );

      throw new InternalServerErrorException(`${errors}`);
    }
  }

  async txStatus(hash: string, chain: Chain): Promise<TransactionStatus> {
    try {
      const res = await this.httpService.get(`/transactions/${chain.toUpperCase()}/${hash}/status`).toPromise();
      return res.data.result.status;
    } catch (err) {
      return "UNKNOWN";
    }
  }

  async getGasFees(ethWallet: Wallet<"ETHEREUM">, bscWallet: Wallet<"BSC">, ethEstimate: number, bscEstimate: number): Promise<GasFees> {
    const { BNB, ETH } = await this.pricing.getCryptoPrices(["BNB", "ETH"], ["UBXT"]);
    const ethGasPriceEstimate = (await this.etherscan.getGasPrice()) || this.gasReserve.chain.ETHEREUM.gasPrice;

    const ethGasPrice = new BN(ethGasPriceEstimate);
    const bscGasPrice = new BN(this.gasReserve.chain.BSC.gasPrice);

    const zero = new BN(0);
    const oneEth = new BN(toWei("1", "ether"));
    const ubxtBnbPair = new BN(toWei(String(BNB.UBXT), "ether"));
    const ubxtEthPair = new BN(toWei(String(ETH.UBXT), "ether"));

    const ethGasCost = ethGasPrice.muln(ethEstimate);
    const bscGasCost = bscGasPrice.muln(bscEstimate);

    let ethCost = ethGasCost.sub(new BN(ethWallet.balance.rawGasBalance));
    let bscCost = bscGasCost.sub(new BN(bscWallet.balance.rawGasBalance));

    ethCost = ethCost.lten(0) ? zero : ethGasCost.muln(this.gasReserve.chain.ETHEREUM.multiplier);
    bscCost = bscCost.lten(0) ? zero : bscGasCost.muln(this.gasReserve.chain.BSC.multiplier);

    const bscUbxtFee = bscCost.mul(ubxtBnbPair).div(oneEth);
    const ethUbxtFee = ethCost.mul(ubxtEthPair).div(oneEth);

    return {
      eth: {
        native: ethCost,
        ubxt: ethUbxtFee,
        gasPrice: ethGasPrice,
      },
      bsc: {
        native: bscCost,
        ubxt: bscUbxtFee,
        gasPrice: bscGasPrice,
      },
      totalUbxt: bscUbxtFee.add(ethUbxtFee),
    };
  }

  get eta() {
    const { gasReserve, etherscan } = this;
    return {
      async forBsc(): Promise<number> {
        return gasReserve.chain.BSC.txEta;
      },
      async forEth(gasPrice: BN): Promise<number> {
        return etherscan.confTime(gasPrice.toNumber());
      },
    };
  }

  async refillWallets(eth: Wallet<"ETHEREUM">, bsc: Wallet<"BSC">, fees: GasFees): Promise<TransactionResponse[]> {
    return Promise.all([this.refillGas(eth, fees.eth.native), this.refillGas(bsc, fees.bsc.native)]);
  }

  async fetchConfTimes(fees: GasFees) {
    return Promise.all([this.eta.forEth(fees.eth.gasPrice), this.eta.forBsc()]);
  }

  private async refillGas(wallet: Wallet<Chain>, value: BN): Promise<TransactionResponse | null> {
    if (value.lten(0)) return null;

    const { address, secretType } = wallet;
    const { pincode } = this.gasReserve;
    const { walletId } = this.gasReserve.chain[secretType];

    const tx: TransactionRequest = {
      to: address,
      type: "TRANSFER",
      walletId, // sender
      secretType,
      value: fromWei(value, "ether"),
    };

    this.logger.log(`Prepaying ${value} gas for ${address}`);

    try {
      const txResponse = await this.execute(tx, pincode);
      return txResponse;
    } catch (e) {
      this.logger.warn(`Gas refill error: ${e}`);
      this.logger.error(e);
      throw new InternalServerErrorException(`Failed to refill user ${secretType} wallet`);
    }
  }

  private async action(params: ActionParams): Promise<TransactionResponse> {
    const { action, ubx, pincode, amount, nonce, signature } = params;
    const tx: TransactionRequest = {
      to: this.pegAddr,
      type: "CONTRACT_EXECUTION",
      walletId: ubx.wallet.id,
      secretType: ubx.wallet.secretType,
      functionName: action,
      inputs: [
        {
          type: "address",
          value: ubx.wallet.address,
        },
        {
          type: "uint256",
          value: amount,
        },
        {
          type: "uint256",
          value: nonce,
        },
        {
          type: "bytes",
          value: signature,
        },
      ],
    };

    return this.execute(tx, pincode);
  }

  private async create(wallet: WalletDto) {
    try {
      const res = await this.httpService.post("/wallets", wallet).toPromise();
      this.logger.log(`Created new ${wallet.secretType} wallet with id ${wallet.identifier}`);

      return res.data;
    } catch (err) {
      this.logger.warn(`Failed to create new ${wallet.secretType} wallet with id ${wallet.identifier}`);
      this.logger.error(`${err}`);

      throw new Error("Failed to create wallets");
    }
  }

  private emptyResponse(tokenAddress: string): ErcToken {
    return {
      balance: 0,
      rawBalance: "0",
      tokenAddress,
    };
  }

  private async getAccessToken(body: GetBearerTokenDto): Promise<BearerTokenResponse> {
    const headers = {
      post: { "Content-Type": "application/x-www-form-urlencoded" },
    };
    const result = await this.httpService.post(this.authHost, qs.stringify(body as any), { headers }).toPromise();

    return result.data;
  }

  private async cacheAccessToken(token: BearerTokenResponse): Promise<string> {
    await this.cache.set(this.cacheKey, token.access_token, { ttl: token.expires_in });
    this.logger.log(`Updated Arkane bearer token, TTL: ${token.expires_in}`);

    return token.access_token;
  }

  private parseEvmErrors(errors: Array<any>): Array<string> {
    return errors.map((e) => `(${e.code}): ${e.message}`);
  }
}
