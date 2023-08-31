import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateQuery } from 'mongoose';
import { PoolDto } from '../dto/pool.dto';
import { mongoDB, IPoolDocument, PoolFilter, IUserDocument, EUserRole } from "@torobot/shared";

@Injectable()
export class PoolService {
  constructor() {}
  async create(pool: PoolDto) {
    const object = await mongoDB.Pools.create(pool);
    return this.getById(object._id);
  }

  async update(pool: IPoolDocument, body: UpdateQuery<IPoolDocument>) {
    await mongoDB.Pools.findOneAndUpdate({ _id: pool._id }, body);
    return this.getById(pool._id);
  }

  delete(pool: IPoolDocument) {
    return mongoDB.Pools.findOneAndDelete({ _id: pool._id });
  }

  async getById(id: string) {
    const doc = await mongoDB.Pools.populateModel(mongoDB.Pools.findById(id));
    return doc as IPoolDocument;
  }

  async validate(id: string): Promise<IPoolDocument> {
    const doc = await this.getById(id);

    if (!doc) {
      throw new NotFoundException('Pool not found');
    }

    return doc as IPoolDocument;
  }

  async getAll() {
    return mongoDB.Pools.populateModel(
      mongoDB.Pools
        .find()
        .sort({created: -1})
    );
  }

  async search(filter: PoolFilter, user: IUserDocument) {
    const where = {
      ...(filter.isRunning ? {autoBot: { "$ne": null }} : {autoBot: { "$eq": null }}),
      ...(filter.size ? {size: { "$gt": filter.size }} : {}),
      ...(filter.chain ? {blockchain: filter.chain} : {}),
      ...(filter.dex ? {dex: filter.dex} : {}),
      ...(filter.token ? {"$or": [{"token1.address": {$regex: new RegExp(filter.token, "i")}}, {"token2.address": {$regex: new RegExp(filter.token, "i")}}]} : {}),
      ...(filter.startDate && filter.endDate ? {created: { '$gte': filter.startDate, '$lte': filter.endDate }} : {}),
    };
    const field = !filter.sort.field || filter.sort.field === "" ? 'created' : filter.sort.field;
    const length = filter.pageLength || 10;
    const start = filter.page ? (filter.page - 1) * length : 0;
    const total = await mongoDB.Pools.countDocuments({...where});
    const pools = await mongoDB.Pools.populateModel(
      mongoDB.Pools
        .find({...where})
        .sort({[field]: filter.sort.order})
        .skip(start)
        .limit(length)
    );
    return {
      total,
      data: pools
    }
  }

  async searchRunning(filter: PoolFilter, user: IUserDocument) {
    const where = {
      ...(user.role !== EUserRole.ADMIN ? {owner: user._id} : {}),
      ...(filter.isRunning ? {autoBot: { "$ne": null }} : {autoBot: { "$eq": null }}),
      ...(filter.size ? {size: { "$gt": filter.size }} : {}),
      ...(filter.chain ? {blockchain: filter.chain} : {}),
      ...(filter.dex ? {dex: filter.dex} : {}),
      ...(filter.token ? {"$or": [{"token1.address": {$regex: new RegExp(filter.token, "i")}}, {"token2.address": {$regex: new RegExp(filter.token, "i")}}]} : {}),
      ...(filter.startDate && filter.endDate ? {created: { '$gte': filter.startDate, '$lte': filter.endDate }} : {}),
    };
    const field = !filter.sort.field || filter.sort.field === "" ? 'created' : filter.sort.field;
    const length = filter.pageLength || 10;
    const start = filter.page ? (filter.page - 1) * length : 0;
    const total = await mongoDB.Pools.countDocuments({...where});
    const pools = await mongoDB.Pools.populateModel(
      mongoDB.Pools
        .find({...where})
        .sort({[field]: filter.sort.order})
        .skip(start)
        .limit(length)
    );
    return {
      total,
      data: pools
    }
  }
}
