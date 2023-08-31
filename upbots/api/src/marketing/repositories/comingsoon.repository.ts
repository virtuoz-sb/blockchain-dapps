/* eslint-disable */
import { Injectable } from "@nestjs/common";

import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import ComingSoon from "../dbmodels/comingsoon";

@Injectable()
export default class ComingSoonRepository {
  constructor(
    @InjectModel("ComingSoon")
    private comingsoonModel: Model<ComingSoon>
  ) {}

  async addComingSoon(comingsoon: Partial<ComingSoon>): Promise<ComingSoon> {
    const newComingSoon = new this.comingsoonModel(comingsoon); // memory style
    await newComingSoon.save();
    return newComingSoon.toObject({ versionKey: false }); // serialization case -> version
  }
}
