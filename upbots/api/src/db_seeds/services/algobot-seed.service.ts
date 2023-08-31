import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BotOrderTrackingDto } from "../../trade/model/bot-order-tracking.dto";
import { AlgoBotSubscriptionModel } from "../../algobot/models/algobot-subscription.model";
import { AlgoBotModel } from "../../algobot/models/algobot.model";
import { algbotFollowers, algobotSeedData } from "../seeds/algobot.seed";
import { copybotSeedData } from "../seeds/copybot.seed";

@Injectable()
export default class AlgobotSeedService implements OnModuleInit {
  private readonly logger = new Logger(AlgobotSeedService.name);

  constructor(
    @InjectModel("AlgobotModel") private botModel: Model<AlgoBotModel>,
    @InjectModel("AlgobotSubscriptionModel") private botSubscriptionModel: Model<AlgoBotSubscriptionModel>,
    @InjectModel("BotOrderTrackingModel") private botOrderTrackModel: Model<BotOrderTrackingDto>
  ) {}

  seedWebhookAlgoBot() {
    // algobotSeedData.forEach((f) => {
    //   this.botModel
    //     .findOneAndUpdate({ botRef: f.botRef }, { ...f }, { new: true, upsert: true })
    //     .then((res) => this.logger.debug(`Collection ${this.botModel.collection.name} successfully seeded`))
    //     .catch((err) => this.logger.error(err));
    // });
    // copybotSeedData.forEach((f) => {
    //   this.botModel
    //     .findOneAndUpdate({ botRef: f.botRef }, { ...f }, { new: true, upsert: true })
    //     .then((res) => this.logger.debug(`Collection ${this.botModel.collection.name} successfully seeded`))
    //     .catch((err) => this.logger.error(err));
    // });
  }

  seedData() {
    this.seedWebhookAlgoBot();
    // this.seedWebhookAlgoBotSubscription();
  }

  seedWebhookAlgoBotSubscription() {
    algbotFollowers.forEach((f) => {
      this.botSubscriptionModel
        .findOneAndUpdate({ _id: f.id }, { ...f }, { new: true, upsert: true })
        .then((res) => this.logger.debug(`Collection ${this.botSubscriptionModel.collection.name} successfully seeded`))
        .catch((err) => this.logger.error(err));
    });
  }

  onModuleInit() {
    if (process.env.MONGO_SEED_DB && process.env.MONGO_SEED_DB === "true") {
      this.logger.warn(
        `Seed module (${AlgobotSeedService.name}) has been initialized and updates collections (flag: ${process.env.MONGO_SEED_DB})`
      );
      this.seedData();
    } else {
      this.logger.warn(`Seed module is disabled, seed scripts didn't run.`);
    }
  }
}
