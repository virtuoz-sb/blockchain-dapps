import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../../types/user";
import { userCustodialWalletsSeedData as seed } from "../seeds/user/custodial-wallets.seed";

@Injectable()
export default class CustodialWalletsSeedService implements OnModuleInit {
  private readonly logger = new Logger(CustodialWalletsSeedService.name);

  constructor(@InjectModel("User") private UserModel: Model<User>) {}

  seedCustodialWallets() {
    seed.forEach((s) => {
      const u = new this.UserModel(s);
      u.save()
        .then(() => this.logger.debug(`Custodial wallets for ${s.custodialWallets.identifier} successfully seeded`))
        .catch((err) => this.logger.error(err));
    });
  }

  onModuleInit() {
    if (process.env.MONGO_SEED_DB && process.env.MONGO_SEED_DB === "true") {
      this.logger.warn(
        `Seed module (${CustodialWalletsSeedService.name}) has been initialized and updates collections (flag: ${process.env.MONGO_SEED_DB})`
      );
      this.seedCustodialWallets();
    } else {
      this.logger.warn(`Seed module is disabled, seed scripts didn't run.`);
    }
  }
}
