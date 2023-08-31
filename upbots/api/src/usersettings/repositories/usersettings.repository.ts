import { Injectable, Logger } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import UserSettings from "../models/usersettings";

const defaultSettings = {
  darkMode: true,
  favoriteCurrency: { value: "usd", label: "USD" },
  algobotFilters: {
    status: { label: "All", value: "all" },
    strategy: { label: "All", value: "all" },
    exchanges: [],
    pairs: [],
    sortedByValue: { label: "Total perf %", value: "performance" },
  },
};
@Injectable()
export default class UserSettingsRepository {
  private readonly logger = new Logger(UserSettingsRepository.name);

  constructor(
    @InjectModel("UserSettings")
    private UserSettingsModel: Model<UserSettings>
  ) {}

  async setUserDefaultSetting(userId: string): Promise<boolean> {
    const res = await this.updateUserSettings(defaultSettings, userId);
    this.logger.log(`Setting up user default settings is ${res ? "successful" : "failed"}`);
    return !!res;
  }

  async setPartialUserDefaultSetting(userId: string, settings: Partial<UserSettings>): Promise<boolean> {
    const res = await this.updateUserSettings(settings, userId);
    this.logger.log(`Setting up user partial default settings is ${res ? "successful" : "failed"}`);
    return !!res;
  }

  async updateUserSettings(userSettings: Partial<UserSettings>, userId: string): Promise<boolean> {
    const res = await this.UserSettingsModel.findOneAndUpdate({ userId }, { ...userSettings }, { new: true, upsert: true });
    this.logger.log(`User settings update ${res ? "successful" : "failed"}`);
    return !!res;
  }

  async getMyUserSettings(userId: string): Promise<Partial<UserSettings>> {
    const res = await this.UserSettingsModel.findOne({ userId }).lean();

    if (!res) {
      this.setUserDefaultSetting(userId);

      return defaultSettings;
    }

    return res;
  }
}
