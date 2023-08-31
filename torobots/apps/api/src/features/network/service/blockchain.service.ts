import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateQuery } from 'mongoose';
import { BlockchainDto } from '../dto/blockchain.dto';
import { mongoDB, IBlockchainDocument } from "@torobot/shared";
@Injectable()
export class BlockchainService {
  constructor() { }

  async create(blockchain: BlockchainDto) {
    const object = await mongoDB.Blockchains.create(blockchain);
    return this.getById(object._id);
  }

  async update(blockchain: IBlockchainDocument, body: UpdateQuery<IBlockchainDocument>) {
    await mongoDB.Blockchains.findOneAndUpdate({ _id: blockchain._id }, body);
    return this.getById(blockchain._id);
  }

  delete(blockchain: IBlockchainDocument) {
    return mongoDB.Blockchains.findOneAndDelete({ _id: blockchain._id });
  }

  async getById(blockchainId: string) {
    const doc = await mongoDB.Blockchains.populateModel(mongoDB.Blockchains.findById(blockchainId));
    return doc as IBlockchainDocument;

  }

  async validate(blockchainId: string) {
    const doc = await this.getById(blockchainId);
    if (!doc) { throw new NotFoundException('Blockchain not found');}
    return doc;
  }

  getAll() {
    return mongoDB.Blockchains.populateModel(mongoDB.Blockchains.find({}));
  }
}