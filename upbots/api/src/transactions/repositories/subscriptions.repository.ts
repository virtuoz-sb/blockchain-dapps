import { Injectable } from "@nestjs/common";

import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import Subscription from "../dbmodels/subscription";

@Injectable()
export default class SubscriptionsRepository {
  constructor(
    @InjectModel("Subscription")
    private subscriptionModel: Model<Subscription>
  ) {}

  async findAll(): Promise<Subscription[]> {
    // console.log("searching for subscriptions");
    return this.subscriptionModel.find();
  }

  async findSubscriptionByItemNumber(itemNumber: string): Promise<Subscription> {
    return this.subscriptionModel.findOne({ item_number: itemNumber });
  }
}
