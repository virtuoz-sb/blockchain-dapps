import { Injectable, HttpService, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ActiveCampaignUser } from "./active-campaign.types";
import { UserIdentity } from "../types/user";
import ActiveCampaignUserDB from "./active-campaign.model";

@Injectable()
export default class ActiveCampaignService {
  private readonly logger = new Logger(ActiveCampaignService.name);

  constructor(
    private readonly httpService: HttpService,
    @InjectModel("AutomationAC")
    private AutomationModel: Model<ActiveCampaignUserDB>
  ) {}

  async addToUserList(user: UserIdentity): Promise<any> {
    const apiUrl = `${process.env.ZAPIER_HOOK_URL}/hooks/catch/6136339/bonj845/`;
    const payload = {
      email: user.email,
      firstName: user.firstname,
      lastName: user.lastname,
      fullName: `${user.firstname} ${user.lastname ? user.lastname : ""}`,
      phoneNumber: user.phone,
      tags: "",
      telegram: user.telegram,
    };
    try {
      const res = await this.httpService.post(apiUrl, payload).toPromise();
      const { data } = res;
      return data;
    } catch (err) {
      this.logger.error(`ZAPIER ERROR (AC User List): ${err}`);
      return err;
    }
  }

  async addToMarketingList(user: UserIdentity): Promise<any> {
    const apiUrl = `${process.env.ZAPIER_HOOK_URL}/hooks/catch/6136339/bonjqfk/`;
    const payload = {
      email: user.email,
      firstName: user.firstname,
      lastName: user.lastname,
      fullName: `${user.firstname} ${user.lastname ? user.lastname : ""}`,
      phoneNumber: user.phone,
      tags: "",
      telegram: user.telegram,
    };
    try {
      const res = await this.httpService.post(apiUrl, payload).toPromise();
      const { data } = res;
      return data;
    } catch (err) {
      this.logger.error(`ZAPIER ERROR (AC Master List): ${err}`);
      return err;
    }
  }

  async updateAutomationListInAC(payload: ActiveCampaignUser): Promise<any> {
    const apiUrl = `${process.env.ZAPIER_HOOK_URL}/hooks/catch/6136339/btj08qn/`;
    try {
      const res = await this.httpService.post(apiUrl, payload).toPromise();
      const { data } = res;
      return data;
    } catch (err) {
      this.logger.error(`ZAPIER ERROR (AC Automation List): ${err}`);
      return err;
    }
  }

  async updateAutomationInDBandAC(user: UserIdentity, tags: string): Promise<boolean> {
    let result = true;
    this.AutomationModel.findOneAndUpdate({ userId: user.id }, { userId: user.id, tags }, { new: true, upsert: true })
      .then(() => {
        this.logger.log(`AC tags have been updated for User ${user.id}`);
        const payload = {
          email: user.email,
          firstName: user.firstname,
          lastName: user.lastname,
          fullName: `${user.firstname} ${user.lastname ? user.lastname : ""}`,
          phoneNumber: user.phone,
          tags,
          telegram: user.telegram,
        };
        const res = this.updateAutomationListInAC(payload);
        if (res) {
          result = true;
        }
      })
      .catch((err) => {
        this.logger.error(err);
        result = false;
      });
    return Promise.resolve(result);
  }

  async getUserAutomationDatabase(userId: string): Promise<ActiveCampaignUserDB> {
    const res = await this.AutomationModel.findOne({ userId });
    return res;
  }
}
