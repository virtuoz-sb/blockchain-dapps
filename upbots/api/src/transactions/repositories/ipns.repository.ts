/* eslint-disable */
import { Injectable } from "@nestjs/common";

import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import Ipn from "../dbmodels/ipn";

@Injectable()
export default class IpnsRepository {
  constructor(
    @InjectModel("Ipn")
    private ipnModel: Model<Ipn>
  ) {}

  async addIpn(ipn: Partial<Ipn>): Promise<Ipn> {
    const newIpn = new this.ipnModel(ipn); // memory style
    await newIpn.save();
    return newIpn.toObject({ versionKey: false }); // serialization case -> version
  }
}
