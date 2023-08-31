import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateQuery } from 'mongoose';
import { DexDto } from '../dto/dex.dto';
import { mongoDB, IDexDocument } from "@torobot/shared";

@Injectable()
export class DexService {
  constructor() {}
  async create(dex: DexDto) {
    const object = await mongoDB.Dexes.create(dex);
    return this.getById(object._id);
  }

  async update(dex: IDexDocument, body: UpdateQuery<IDexDocument>) {
    await mongoDB.Dexes.findOneAndUpdate({ _id: dex._id }, body);
    return this.getById(dex._id);
  }

  delete(dex: IDexDocument) {
    return mongoDB.Dexes.findOneAndDelete({ _id: dex._id });
  }

  async getById(dexId: string) {
    const doc = await mongoDB.Dexes.populateModel(mongoDB.Dexes.findById(dexId));
    return doc as IDexDocument;
  }

  async validate(dexId: string) {
    const doc = await this.getById(dexId);

    if (!doc) {
      throw new NotFoundException('Dex not found');
    }

    return doc;
  }

  getAll() {
    return mongoDB.Dexes.populateModel(mongoDB.Dexes.find({}));
  }
}