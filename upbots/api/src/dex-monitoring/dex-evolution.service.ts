import { HttpService, Injectable, Logger, Inject, CACHE_MANAGER } from "@nestjs/common";
import { Cache } from "cache-manager";
import { InjectModel } from "@nestjs/mongoose";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Model } from "mongoose";
import { timer } from "rxjs";
import { take } from "rxjs/operators";

import * as moment from "moment";
import DexMonitoringService from "./dex-monitoring.service";
import { DexAssets } from "./models/dex-assets.schema";
import DexAssetsDto from "./models/dexAssets.dto";

@Injectable()
export default class DexEvolutionService {
  private readonly logger = new Logger(DexEvolutionService.name);

  constructor(
    @InjectModel(DexAssets.name) private dexAssetsModel: Model<DexAssets>,
    private readonly httpService: HttpService,
    private readonly dexMonitoringService: DexMonitoringService,
    @Inject(CACHE_MANAGER) private cache: Cache
  ) {}

  private formatDexEvolution(raw: any[]): DexAssetsDto[] {
    return raw.map((elem) => ({
      address: elem.address,
      evolution: elem.evolution,
    }));
  }

  private clearCache(userId: string) {
    return this.cache.del(`evolution:${userId}`);
  }

  async createEvolution(userId: string, addresses: string[], oldEvolution?: DexAssetsDto[]) {
    await this.clearCache(userId);
    const evolutionArr =
      oldEvolution ||
      (await Promise.all(
        addresses.map(async (address) => ({
          address,
          evolution: [await this.getAddressNetworth(address)],
        }))
      ));
    try {
      const res = await this.dexAssetsModel.create(
        evolutionArr.map((elem) => ({
          user: userId,
          ...elem,
        }))
      );
      if (res && res.length) {
        const evolution = this.formatDexEvolution(res);
        this.cache.set(`evolution:${userId}`, evolution, {
          ttl: 3600 * 6,
        });
        return evolution;
      }
    } catch (ex) {
      this.logger.error(`Creating evolution error: ${ex}`);
    }
    return oldEvolution;
  }

  async deleteEvolution(userId: string, address: string) {
    await this.clearCache(userId);
    return this.dexAssetsModel.deleteOne({
      user: userId,
      address,
    });
  }

  async getEvolution(userId: string, oldEvolution?: DexAssetsDto[]) {
    const cachedEvolution = await this.cache.get(`evolution:${userId}`);
    if (cachedEvolution) return cachedEvolution;
    const res = await this.dexAssetsModel.find({
      user: userId,
    });
    if (res && res.length) {
      const evolution = this.formatDexEvolution(res);
      this.cache.set(`evolution:${userId}`, evolution, {
        ttl: 3600 * 6,
      });
      return evolution;
    }
    return this.createEvolution(userId, null, oldEvolution);
  }

  private async getAddressNetworth(address: string) {
    const balance = await this.dexMonitoringService.getAddressBalances([address], false);
    let res = 0;

    balance.tokens.forEach((token) => {
      if (token && token.quote) {
        res += token.quote;
      }
    });

    const dayEvolution = {
      usd: res,
      eur: res * balance.quoteCurrencyConversionRates.eur,
      btc: res * balance.quoteCurrencyConversionRates.btc,
      date: new Date(),
    };

    return dayEvolution;
  }

  async runDexEvolutionTask() {
    this.logger.log(`run dex evolution update manually`, "DexEvolutionService");
    this.dexEvolutionTask();
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async dexEvolutionTask() {
    const dexAssetList = await this.dexAssetsModel.find().sort({ updatedAt: 1 });
    this.logger.log(`start dex evolution update`, "DexEvolutionService");
    await dexAssetList.reduce(async (a, dexAsset) => {
      // Wait for the previous item to finish processing
      await a;
      // Process this item
      if (dexAsset?.address && dexAsset?.evolution) {
        const todayEvolution = await this.getAddressNetworth(dexAsset.address);
        const lastElem = dexAsset.evolution.length - 1;

        if (moment().day() !== moment(dexAsset.evolution[lastElem].date).day()) {
          this.logger.log(`adding a new day evolution for address ${dexAsset.address}`, "DexEvolutionService");
          const newDexAsset = dexAsset;
          newDexAsset.evolution.push(todayEvolution);
          newDexAsset.updatedAt = moment().toDate();
          await newDexAsset.save();
        }
        // wait a 5 seconds before process the next dex asset.
        await timer(5000).pipe(take(1)).toPromise();
      }
    }, Promise.resolve());
    this.logger.log(`dex evolution update end`, "DexEvolutionService");
  }
}
