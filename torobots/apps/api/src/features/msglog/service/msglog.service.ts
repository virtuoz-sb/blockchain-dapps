import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateQuery } from 'mongoose';
import { MsglogDto } from '../dto/msglog.dto';
import { mongoDB, IMsglogDocument } from "@torobot/shared";

@Injectable()
export class MsglogService {
  constructor() { }

  async create(msglog: MsglogDto) {
    const object = await mongoDB.Msglogs.create(msglog);
    return this.getById(object._id);
  }

  async update(msglog: IMsglogDocument, body: UpdateQuery<IMsglogDocument>) {
    await mongoDB.Msglogs.findOneAndUpdate({ _id: msglog._id }, body);
    return this.getById(msglog._id);
  }

  delete(msglog: IMsglogDocument) {
    return mongoDB.Msglogs.findOneAndDelete({ _id: msglog._id });
  }

  async getById(msglogId: string) {
    const doc = await mongoDB.Msglogs.populateModel(mongoDB.Msglogs.findById(msglogId));
    return doc as IMsglogDocument;
  }

  async validate(msglogId: string): Promise<IMsglogDocument> {
    const doc = await this.getById(msglogId);
    if (!doc) {
      throw new NotFoundException('Msglog not found');
    }
    return doc as IMsglogDocument;
  }

  async getAll() {
    return mongoDB.Msglogs.populateModel(mongoDB.Msglogs.find({}).sort({ created: -1 }));
  }
}