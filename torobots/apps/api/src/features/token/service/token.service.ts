import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateQuery } from 'mongoose';
import { TokenDto, TokenDetailReqDto, TokenDetailDto } from '../dto/token.dto';
import { 
  mongoDB, ITokenDocument,
  BlockchainClient, ERC20Token
 } from "@torobot/shared";

@Injectable()
export class TokenService {
  constructor() {}
  async create(token: TokenDto) {
    const object = await mongoDB.Tokens.create(token);
    return this.getById(object._id);
  }

  async update(token: ITokenDocument, body: UpdateQuery<ITokenDocument>) {
    await mongoDB.Tokens.findOneAndUpdate({ _id: token._id }, body);
    return this.getById(token._id);
  }

  delete(token: ITokenDocument) {
    return mongoDB.Tokens.findOneAndDelete({ _id: token._id });
  }

  async getById(id: string) {
    const doc = await mongoDB.Tokens.populateModel(mongoDB.Tokens.findById(id));
    return doc as ITokenDocument;
  }

  async getByAddress(blockchain: string, address: string) {
    const doc = await mongoDB.Tokens.populateModel(mongoDB.Tokens.findOne({ address, blockchain }));
    return doc as ITokenDocument;
  }

  async validate(id: string): Promise<ITokenDocument> {
    const doc = await this.getById(id);

    if (!doc) {
      throw new NotFoundException('Token not found');
    }

    return doc as ITokenDocument;
  }

  getAll() {
    return mongoDB.Tokens.populateModel(mongoDB.Tokens.find());
  }

  async addByDetail(reqDto: TokenDetailReqDto) {
    const token = await this.getByAddress(reqDto.blockchainId, reqDto.tokenAddress);
    if (token) {
      return token;
    }

    const tokenDetail = await this.getDetail(reqDto);
    const createdToken = await this.create({
      address: tokenDetail.token.address,
      name: tokenDetail.token.name,
      symbol: tokenDetail.token.symbol,
      decimals: tokenDetail.token.decimals,
      totalSupply: tokenDetail.token.totalSupply,
      blockchain: tokenDetail.token.blockchain as string,
      createdAt: null
    })

    return createdToken;
  }

  async getDetail(reqDto: TokenDetailReqDto) {
    try {
      const blockchain = await mongoDB.Blockchains.findById(reqDto.blockchainId);
      const node = await mongoDB.Nodes.findById(reqDto.nodeId ? reqDto.nodeId : blockchain.node);
      // const dex: IDex = await mongoDB.Dexes.findById(reqDto.dexId);
      const wallet = reqDto.walletId ? await mongoDB.Wallets.findById(reqDto.walletId) : null;
  
      const blockchainClient = new BlockchainClient(blockchain, node, wallet);
      // const uniswapDex: UniswapDex = new UniswapDex(blockchainClient, dex);
      const coinERC20 = new ERC20Token(blockchainClient, reqDto.coinAddress);
      const tokenERC20 = new ERC20Token(blockchainClient, reqDto.tokenAddress);
  
      await blockchainClient.init();
      // await uniswapDex.init();

      let dto: TokenDetailDto = {};
      if (reqDto.netCoin) {
        dto.netCoin = {
          symbol: blockchain.coinSymbol,
          balance: await blockchainClient.accountBalance.toNumber()
        }
      }

      if (reqDto.coinAddress) {
        await coinERC20.init();
        dto.coin = {
          blockchain: reqDto.blockchainId,
          address: reqDto.tokenAddress,
          name: coinERC20.name,
          symbol: coinERC20.symbol,
          decimals: coinERC20.decimals,
          totalSupply: coinERC20.totalSupply.toNumber(),
          balance: coinERC20.userBalance.toNumber()
        }
      }

      if (reqDto.tokenAddress) {
        await tokenERC20.init();
        dto.token = {
          blockchain: reqDto.blockchainId,
          address: reqDto.tokenAddress,
          name: tokenERC20.name,
          symbol: tokenERC20.symbol,
          decimals: tokenERC20.decimals,
          totalSupply: tokenERC20.totalSupply.toNumber(),
          balance: tokenERC20.userBalance.toNumber()
        }
      }

      return dto;
    } catch (e) {
      console.log('token.service@getInfo-err:', e.message);
      throw new BadRequestException(e.message);
    }
  }
}