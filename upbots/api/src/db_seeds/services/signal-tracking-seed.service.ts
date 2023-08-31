/* eslint-disable no-underscore-dangle */
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as moment from "moment";
import { SignalTrackingDto, SignalTrackingModel } from "../../algobot/models/signal-tracking.dto";
import { AlgoBotModel } from "../../algobot/models/algobot.model";
import { SignalTrackingModelName } from "../../algobot/models/signal-tracking.schema";
import {
  optimusbtc,
  optimusbnb,
  optimuseth,
  irobotbtc,
  irobotbnb,
  iroboteth,
  avaxusdt1,
  tomolo1,
  framav2eth,
  ethinfinity,
  supertradereth,
  supertraderlink,
  supertraderbnb,
  spoonerbtc,
  spoonereth,
  spoonerlink,
  spoonerftt,
  pgbtc,
  pgeth,
  pgbat,
  pgdoge,
  pgbnb,
  pgmatic,
  pgtrx,
  wteth,
  wtetc,
  wtbnb,
  wtsol,
  wtcake,
  wtshib,
  nlsftt,
  surgebotsxp,
  fluctusbtc,
  harsibtc,
  laikaada,
  laikaavax,
  laikaatom,
  laikanear,
  gravitydusk,
  gravitynuls,
} from "../seeds/algobot_signals";

@Injectable()
export default class SignalTrackingSeedService implements OnModuleInit {
  private readonly logger = new Logger(SignalTrackingSeedService.name);

  constructor(
    @InjectModel(SignalTrackingModelName) private signalTrackingModel: Model<SignalTrackingModel>,
    @InjectModel("AlgobotModel") private botModel: Model<AlgoBotModel>
  ) {}

  async mapSeed(seedFile: any[]): Promise<SignalTrackingDto[]> {
    const botId = await this.botModel.findOne({ botRef: seedFile[0].botRef }).then((q) => q._id);
    return seedFile.map((seed) => {
      return {
        ...seed,
        botId,
        estimatedPrice: parseFloat(seed.estimatedPrice),
        signalDateTime: moment(seed.signalDateTime).toDate(),
        botCycle: parseInt(seed.botCycle, 10),
      };
    });
  }

  seedSignalTrackings(seed: SignalTrackingDto[]) {
    seed.forEach((f) => {
      let condition: any = { botRef: f.botRef, botCycle: f.botCycle, position: f.position };
      if (f.botVer) {
        condition = { ...condition, botVer: f.botVer };
      } else {
        condition = { ...condition, botVer: { $exists: false } };
      }
      this.signalTrackingModel
        .findOneAndUpdate(condition, { ...f }, { new: true, upsert: true })
        .then((res) => this.logger.debug(`Collection ${this.signalTrackingModel.collection.name} successfully seeded`))
        .catch((err) => this.logger.error(err));
    });
  }

  seedBots() {
    this.mapSeed(optimusbtc).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(optimuseth).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(optimusbnb).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(irobotbtc).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(iroboteth).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(irobotbnb).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(avaxusdt1).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(tomolo1).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(framav2eth).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(ethinfinity).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(supertradereth).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(supertraderlink).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(supertraderbnb).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(spoonerbtc).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(spoonereth).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(spoonerlink).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(spoonerftt).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(pgbtc).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(pgeth).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(pgbat).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(pgdoge).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(pgbnb).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(pgmatic).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(pgtrx).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(wteth).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(wtetc).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(wtbnb).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(wtsol).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(wtcake).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(wtshib).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(nlsftt).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(surgebotsxp).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(fluctusbtc).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(harsibtc).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(laikaada).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(laikaavax).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(laikaatom).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(laikanear).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(gravitydusk).then((seed) => this.seedSignalTrackings(seed));
    this.mapSeed(gravitynuls).then((seed) => this.seedSignalTrackings(seed));
  }

  seedData() {
    this.seedBots();
  }

  onModuleInit() {
    if (process.env.MONGO_SEED_DB && process.env.MONGO_SEED_DB === "true") {
      this.logger.warn(
        `Seed module (${SignalTrackingSeedService.name}) has been initialized and updates collections (flag: ${process.env.MONGO_SEED_DB})`
      );
      this.seedData();
    } else {
      this.logger.warn(`Seed module is disabled, seed scripts didn't run.`);
    }
  }
}
