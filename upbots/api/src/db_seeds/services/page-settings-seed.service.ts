import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Cron } from "@nestjs/schedule";
import { Model } from "mongoose";
import PageSettingsModel from "../../settings/models/page/page-settings.model";
import settingsPagesSeeds from "../seeds/page/pages-settings.seed";
import { Result, seedHandler } from "./seed-handler";

@Injectable()
export default class PageSettingsSeedService implements OnModuleInit {
  private readonly logger = new Logger(PageSettingsSeedService.name);

  constructor(@InjectModel(PageSettingsModel.name) private modelSvc: Model<PageSettingsModel>) {}

  async onModuleInit() {
    // @TODO: enable this in a separate first run setup task
    // await this.seedData();
  }

  @Cron("0 1 * * *") // every day at 1 am
  async seedData(): Promise<void> {
    const doSeed = process.env.MONGO_SEED_DB && process.env.MONGO_SEED_DB === "true";
    await seedHandler(this.createUpdatePageSettings.bind(this), doSeed, this.logger); // bind(this) so that handler may use this class context
  }

  async createUpdatePageSettings(): Promise<Result<PageSettingsModel>[]> {
    const pages = settingsPagesSeeds;

    const results = await Promise.all(
      pages.map((p) => {
        return this.modelSvc
          .findOneAndUpdate({ name: p.name }, p, { upsert: true })
          .then((x) => ({ data: x } as Result<PageSettingsModel>))
          .catch((e) => ({ error: e } as Result<PageSettingsModel>)); // catch partial failure
      })
    );
    return results;
  }
}
