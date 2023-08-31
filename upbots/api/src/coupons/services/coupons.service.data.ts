/* eslint-disable new-cap */
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Dictionary } from "ccxt";
import { Model } from "mongoose";
import * as moment from "moment";
import { Coupons, CouponsCreationDto, GetCoupons } from "../models/coupons.types";

@Injectable()
class CouponsServiceData {
  constructor(@InjectModel("Coupons") private couponModel: Model<Coupons>) {}

  async postCoupons(codes: string[], dto: CouponsCreationDto): Promise<GetCoupons[]> {
    const toCreate = codes.map((code) => {
      const newCoupon = new this.couponModel({
        code,
        promoName: dto.promoName,
        description: dto.description,
        couponType: dto.couponType,
        validFrom: moment(dto.validFrom),
        validTo: moment(dto.validTo),
      });
      return newCoupon;
    });
    const coupons = await this.couponModel.insertMany(toCreate);
    return this.couponsMapData(coupons);
  }

  async getCouponsFiltered(filters: Dictionary<string>): Promise<GetCoupons[]> {
    const coupons = await this.couponModel.find({ ...filters }).populate("userId", "email");
    return this.couponsMapData(coupons);
  }

  async getOneCouponByCode(couponCode: string): Promise<GetCoupons> {
    const coupon = await this.couponModel.find({ code: couponCode }).populate("userId", "email");
    return this.couponsMapData(coupon)[0];
  }

  async activateUniqueCoupon(code: string, userId: string): Promise<boolean> {
    const q = await this.couponModel.updateOne({ code }, { userId, activated: true, activationDate: new Date() });
    const { nModified }: { nModified: number } = q;

    return nModified === 1;
  }

  couponsMapData(coupons: Coupons[]): GetCoupons[] {
    return coupons.map((coupon) => {
      const { code, promoName, description, activated, activationDate, couponType, validFrom, validTo, userId } = coupon;
      return {
        code,
        promoName,
        description,
        activated,
        activationDate,
        couponType,
        validFrom,
        validTo,
        user: userId,
      };
    });
  }
}

export default CouponsServiceData;
