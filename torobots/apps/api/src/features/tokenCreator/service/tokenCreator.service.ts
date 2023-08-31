import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateQuery } from 'mongoose';
import { TokenCreatorDto } from '../dto/tokenCreator.dto';
import { TokenCreatorBotEngineService } from './tokenCreatorBot-engine.service';
import { 
  mongoDB, 
  ITokenCreatorDocument,
  TokenCreatorFilter
} from "@torobot/shared";
import { CounterService } from 'src/features/counter/service/counter.service';

@Injectable()
export class TokenCreatorService {
  constructor(
    private botEnginService: TokenCreatorBotEngineService,
    private counterService: CounterService,
  ) {}
  async create(token: TokenCreatorDto) {
    const uniqueNum = await this.counterService.getNextSequenceValue("TokenCreator");
    const object = await mongoDB.TokenCreators.create({...token, uniqueNum: uniqueNum});
    this.botEnginService.create(object._id);
    return this.getById(object._id);
  }

  async update(token: ITokenCreatorDocument, body: UpdateQuery<ITokenCreatorDocument>) {
    await mongoDB.TokenCreators.findOneAndUpdate({ _id: token._id }, body);
    return this.getById(token._id);
  }

  delete(token: ITokenCreatorDocument) {
    return mongoDB.TokenCreators.findOneAndDelete({ _id: token._id });
  }

  async getById(id: string) {
    const doc = await mongoDB.TokenCreators.populateModel(mongoDB.TokenCreators.findById(id));
    return doc as ITokenCreatorDocument;
  }

  async getByAddress(blockchain: string, address: string) {
    const doc = await mongoDB.TokenCreators.populateModel(mongoDB.TokenCreators.findOne({ address, blockchain }));
    return doc as ITokenCreatorDocument;
  }

  async validate(id: string): Promise<ITokenCreatorDocument> {
    const doc = await this.getById(id);

    if (!doc) {
      throw new NotFoundException('Token not found');
    }

    return doc as ITokenCreatorDocument;
  }

  getAll() {
    return mongoDB.TokenCreators.populateModel(mongoDB.TokenCreators.find());
  }

  async mintToken(payload: {amount: string, creatorId: string}) {
    const doc = await this.validate(payload.creatorId);
    doc.state = {
      action: 'Minting',
      result: ''
    };
    await doc.save();
    this.botEnginService.mintToken(payload);
    return true;
  }

  async burnToken(payload: {amount: string, creatorId: string}) {
    const doc = await this.validate(payload.creatorId);
    doc.state = {
      action: 'Burning',
      result: ''
    };
    await doc.save();
    this.botEnginService.burnToken(payload);
    return true;
  }

  async addLP(payload: {baseCoinAddress: string, baseCoinAmount: string, tokenAmount: string, dexId: string, creatorId: string}) {
    const doc = await this.validate(payload.creatorId);
    doc.state = {
      action: 'Adding LP',
      result: ''
    };
    await doc.save();

    this.botEnginService.addLP(payload);
    return true;
  }

  async removeLP(payload: {baseCoinAddress: string, lpAddress: string, lpAmount: string, dexId: string, creatorId: string}) {
    const doc = await this.validate(payload.creatorId);
    doc.state = {
      action: 'Removing LP',
      result: ''
    };
    await doc.save();

    this.botEnginService.removeLP(payload);
    return true;
  }

  async search(filter: TokenCreatorFilter) {
    const where = {};
    const length = filter.pageLength || 10;
    const start = filter.page ? (filter.page - 1) * length : 0;
    const total = await mongoDB.TokenCreators.countDocuments({...where});
    const data = await mongoDB.TokenCreators.populateModel(
      mongoDB.TokenCreators
        .find({...where})
        .sort({stateNum: -1, updated: -1})
        .skip(start)
        .limit(length)
    );
    
    return {
      total,
      data
    }
  }

  async getAllMintBrunTransactions(creatorId: string) {
    return mongoDB.TokenMintBurnTransaction.populateModel(await mongoDB.TokenMintBurnTransaction.find({tokenCreator: creatorId}));
  }

  async getAllLiquidityPoolTransactions(creatorId: string) {
    return mongoDB.LiquidityPoolTransaction.populateModel(await mongoDB.LiquidityPoolTransaction.find({tokenCreator: creatorId}));
  }
}