import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateQuery } from 'mongoose';
import { remove } from '../../../shared/utils/remove';
import { CoinDto } from '../dto/coin.dto';
import { 
  mongoDB, IUserDocument, ICoinDocument,
 } from "@torobot/shared";
 import { TokenService } from '../../token/service/token.service';
 import { TokenDetailReqDto } from '../../token/dto/token.dto';

@Injectable()
export class CoinService {
  constructor(
    private tokenService: TokenService,
  ) {}
  async create(coin: CoinDto) {
    const object = await mongoDB.Coins.create(coin);
    return this.getById(object._id);
  }

  async update(coin: ICoinDocument, body: UpdateQuery<ICoinDocument>) {
    await mongoDB.Coins.findOneAndUpdate({ _id: coin._id }, body);
    return this.getById(coin._id);
  }

  delete(coin: ICoinDocument) {
    return mongoDB.Coins.findOneAndDelete({ _id: coin._id });
  }

  async getById(id: string) {
    const doc = await mongoDB.Coins.populateModel(mongoDB.Coins.findById(id));
    return doc as ICoinDocument;
  }

  async getByAddress(blockchain: string, address: string) {
    const doc = await mongoDB.Tokens.populateModel(mongoDB.Tokens.findOne({ address, blockchain }));
    return doc as ICoinDocument;
  }

  async validate(id: string): Promise<ICoinDocument> {
    const doc = await this.getById(id);

    if (!doc) {
      throw new NotFoundException('Coin not found');
    }

    return doc as ICoinDocument;
  }

  getAll() {
    return mongoDB.Coins.populateModel(mongoDB.Coins.find());
  }

  async fillDtoByDetail(payload: any) {
    const tokenDetailReq: TokenDetailReqDto = {
      blockchainId: payload.blockchain,
      tokenAddress: payload.address
    };
    const tokenDetail = await this.tokenService.getDetail(tokenDetailReq);
    const coinDto = {
      ...tokenDetail.token,
      blockchain: payload.blockchain
    };

    return coinDto;
  }
}