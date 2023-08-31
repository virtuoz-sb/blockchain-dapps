import { Injectable, Logger } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import * as moment from "moment";
import { LoginTrackingDto, LoginTrackingPublicDto } from "./login-tracking.models";
import { UserIdentity } from "../types/user";

@Injectable()
export default class LoginTrackingService {
  private readonly logger = new Logger(LoginTrackingService.name);

  constructor(
    @InjectModel("LoginTracking")
    private LoginTrackingModel: Model<LoginTrackingDto>
  ) {}

  async getActiveUserList(dateFrom: Date, dateTo: Date): Promise<LoginTrackingPublicDto[]> {
    const userList = [];

    const start = moment(dateFrom, "YYYY-MM-DD");
    const end = moment(dateTo, "YYYY-MM-DD");

    const numberOfDays = end.diff(start, "days");

    const result = new Promise<LoginTrackingPublicDto[]>((resolve, reject) => {
      this.LoginTrackingModel.find(
        {
          login: {
            $gte: dateFrom,
            $lte: dateTo,
          },
        },
        (err, val) => {
          if (err) {
            this.logger.error(`get login tracking error': ${err}`);
            return reject(err);
          }

          val.forEach((element) => {
            const localUser = val.filter((data) => data.email === element.email);

            const filtered = localUser.map((item) => item).filter((value, index, self) => self.indexOf(value) === index);

            if (filtered.length >= numberOfDays) {
              userList.push({ email: element.email, firstname: element.firstname, login: element.login });
            }
          });

          const emailArr: Array<string> = [];
          const data: Array<LoginTrackingPublicDto> = [];
          userList.forEach((element) => {
            if (!emailArr.includes(element.email)) {
              data.push(element);
              emailArr.push(element.email);
            }
          });

          return resolve(data);
        }
      );
    });

    return result;
  }

  async getLogByEmail(email: string): Promise<any> {
    const res = await this.LoginTrackingModel.find({ email });
    return res;
  }

  async getPreviousLoginTrack(
    userId: string,
    userInfo: {
      ip: any;
      address: string;
      device: any;
    }
  ): Promise<any> {
    const prevRecord = await this.LoginTrackingModel.findOne({ userId, success: true, "userAccess.address": userInfo.address });
    return prevRecord;
  }

  async getPendingLoginTrack(userId: string, code: string): Promise<any> {
    if (code && code.length > 0) {
      const pendingRecord = await this.LoginTrackingModel.findOneAndDelete({ userId, success: false, pending: code });
      if (pendingRecord) {
        const expired = new Date().getTime() - new Date(pendingRecord.login).getTime() > 300000; // expires after 5 mins
        return expired ? null : pendingRecord.userAccess;
      }
    }
    return null;
  }

  async updateUserLoginTimeStamp(user: UserIdentity, userInfo?: any, isNewIp = false, confirmCode = ""): Promise<boolean> {
    this.logger.error(`login-tracking@updateUserLoginTimeStamp: email=${user.email}, userAccess=${JSON.stringify(userInfo)}`);

    try {
      const baseInfo = {
        userId: user.id,
        email: user.email,
        firstname: user.firstname,
        login: new Date(),
        userAccess: userInfo,
        success: !isNewIp,
      };

      const newTimeStamp = new this.LoginTrackingModel(
        isNewIp
          ? {
              ...baseInfo,
              pending: confirmCode,
            }
          : { ...baseInfo }
      );

      const currentDay = newTimeStamp.login;
      let isSavedToday = false;

      const res = await this.LoginTrackingModel.find(
        { email: newTimeStamp.email, success: true, "userAccess.address": userInfo.address },
        null,
        { sort: { login: -1 } }
      ).limit(1);
      const lastTracking = res && res.length > 0 ? res[0] : null;
      if (lastTracking && !isNewIp) {
        const day = lastTracking.login;

        if (
          day.getDay() === currentDay.getDay() &&
          day.getMonth() === currentDay.getMonth() &&
          day.getFullYear() === currentDay.getFullYear()
        ) {
          isSavedToday = true;

          lastTracking.success = true;
          lastTracking.userAccess = baseInfo.userAccess;
          lastTracking.login = baseInfo.login;
          await lastTracking.save();
        }
      }

      if (!isSavedToday) {
        await newTimeStamp.save().then(() => this.logger.log(`User has successfully updated his login timestamp`));
        return Promise.resolve(true);
      }
      return Promise.resolve(false);
    } catch (e) {
      return false;
    }
  }
}
