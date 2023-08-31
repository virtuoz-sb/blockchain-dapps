/* eslint-disable new-cap */
/* eslint-disable no-underscore-dangle */
import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ExchangeKeyCreationDto, ExchangeKey, ExchangeKeyDto, ExchangeKeyEditDto } from "../../types/exchange-key";

/**
 * CRUD repository service for user's exchange keys.
 */
@Injectable()
export default class ExchangeKeyDataService {
  private readonly logger = new Logger(ExchangeKeyDataService.name);

  // @InjectModel('ExchangeKey') goes in pair with MongooseModule.forFeature() in shared.module.ts
  constructor(@InjectModel("ExchangeKey") private keyModel: Model<ExchangeKey>) {}

  async createKey(userId: string, dto: ExchangeKeyCreationDto, type = "spot", quoteCurrency = "USDT"): Promise<ExchangeKey> {
    // this.logger.debug(`to create: ${JSON.stringify(dto)}`);
    const now = new Date();
    const newKey = new this.keyModel({
      userId,
      name: dto.name,
      exchange: dto.exchange,
      type,
      quoteCurrency,
      publicKey: dto.publicKey,
      secretKey: dto.secretKey,
      password: dto.password,
      subAccountName: dto.subAccountName,
      created: now,
      updated: now,
    });
    const key = await newKey.save();
    return key;
  }

  async updateKey(userId: string, dto: ExchangeKeyEditDto): Promise<boolean> {
    const { id, name } = dto;
    const payload = { name, updated: new Date() };
    // payload.updated = new Date();

    const q = await this.keyModel.updateOne({ _id: id, userId }, payload);
    const { nModified }: { nModified: number } = q;
    // this.logger.debug(`Key ${id} updated. nModified:${nModified} `);

    return nModified === 1;
  }

  async updateValidityStatus(keyId: string, valid: boolean, error?: string): Promise<boolean> {
    const q = await this.keyModel.updateOne({ _id: keyId }, { valid, lastHealthCheck: new Date(), error });
    const { nModified }: { nModified: number } = q;
    return nModified === 1;
  }

  async deleteKey(userId: string, keyId: string): Promise<boolean> {
    const q = await this.keyModel.deleteOne({ _id: keyId, userId });
    const { deletedCount }: { deletedCount?: number } = q;
    // this.logger.debug(`Key ${id} updated. nModified:${nModified} `);

    return deletedCount === 1;
  }

  async findAllKeysForDisplay(userId: string): Promise<ExchangeKeyDto[]> {
    const res = await this.keyModel
      .find({ userId }, null, {
        sort: { updated: -1 },
      })
      .lean();
    return res ? res.map(this.mapToDto) : new Array<ExchangeKeyDto>();
  }

  async findOneKeyForDisplay(keyId: string): Promise<ExchangeKeyDto> {
    const res = await this.keyModel.findById(keyId).lean<ExchangeKey>();
    return res ? [res].map(this.mapToDto)[0] : new ExchangeKeyDto();
  }

  async findOneDecryptedKey(keyId: string): Promise<ExchangeKey> {
    const res = await this.keyModel.findById(keyId);
    return res;
  }

  async findDecryptedKeysForExchange(exchangeName: string): Promise<ExchangeKey[]> {
    this.logger.debug(`findDecryptedKeysForExchange for ex ch ${exchangeName}`);
    const keys = await this.keyModel
      .find({ exchange: exchangeName, valid: true }, null, {
        sort: { updated: -1 },
      })
      .lean<ExchangeKey>();
    return keys;
  }

  async findDecryptedKeys(userId: string, keynamesFilter?: string[]): Promise<ExchangeKey[]> {
    if (keynamesFilter && keynamesFilter.length > 0) {
      // this.logger.debug(`findDecryptedKeys for usr:${userId} and keyname${keynamesFilter}`);
      return this.keyModel
        .find({ userId, name: { $in: keynamesFilter } }, null, {
          sort: { updated: -1 },
        })
        .lean<ExchangeKey>();
    }
    // this.logger.debug(`findDecryptedKeys for usr:${userId} (no filter)`);

    return this.keyModel.find({ userId }, null, {
      sort: { updated: -1 },
    });
  }

  async findAllDecryptedKeys(keynamesFilter?: string[]): Promise<ExchangeKey[]> {
    if (keynamesFilter && keynamesFilter.length > 0) {
      // this.logger.debug(`findDecryptedKeys for usr:${userId} and keyname${keynamesFilter}`);
      return this.keyModel.find({ name: { $in: keynamesFilter } }, null, {
        sort: { updated: -1 },
      });
    }
    // this.logger.debug(`findDecryptedKeys for usr:${userId} (no filter)`);

    return this.keyModel.find({}, null, {
      sort: { updated: -1 },
    });
  }

  async findAllInvalidKeyIds(): Promise<string[]> {
    const keys = await this.keyModel.find({ valid: false }).lean();
    return keys.map((key) => key._id);
  }

  private mapToDto(x: ExchangeKey): ExchangeKeyDto {
    return {
      // eslint-disable-next-line no-underscore-dangle
      id: x._id,
      name: x.name,
      created: x.created,
      exchange: x.exchange,
      type: x.type,
      quoteCurrency: x.quoteCurrency,
      publicKey: x.publicKey,
      valid: x.valid,
      lastHealthCheck: x.lastHealthCheck,
      // error: x.error, //avoid exposing technical details to the front
      updated: x.updated,
    };
  }
}
