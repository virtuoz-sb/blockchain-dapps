/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */

import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import * as moment from "moment";

@Injectable()
export default class PaidSubscriptionService {
  private readonly logger = new Logger(PaidSubscriptionService.name);

  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    name: "paid-subscriptions",
  })
  async handlePaidSubscriptions() {
    return true;
  }
}
