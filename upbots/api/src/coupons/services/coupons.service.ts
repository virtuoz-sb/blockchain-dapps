import { Injectable } from "@nestjs/common";
import { Dictionary } from "ccxt";
import { randomBytes } from "crypto";
import { CouponsCreationDto, GetCoupons } from "../models/coupons.types";
import CouponsServiceData from "./coupons.service.data";

@Injectable()
class CouponsService {
  constructor(private couponsServiceData: CouponsServiceData) {}

  async couponIsEligible(code: string): Promise<boolean> {
    const coupon = await this.couponsServiceData.getOneCouponByCode(code);

    if (!coupon) {
      throw new Error(`Couldn't find coupon [${code}], please double check the code or try again later.`);
    }

    // If validity range: check validity date conditions.
    if (coupon.validFrom || coupon.validTo) {
      const activatedTime = new Date().getTime();
      if (coupon.validFrom.getTime() > activatedTime || coupon.validTo.getTime() < activatedTime) {
        return false;
      }
    }

    // If cooupon is unique, then it can't be already activated or attached to a userId.
    if (coupon.couponType === "unique" && !coupon.activated && !coupon.user) {
      return true;
    }

    // If coupon is global and date is valid, then it's ok.
    if (coupon.couponType === "global") {
      return true;
    }

    return false;
  }

  async getCouponsFiltered(filters: Dictionary<string>): Promise<GetCoupons[]> {
    const coupons = await this.couponsServiceData.getCouponsFiltered({ ...filters });
    return coupons;
  }

  async activateUniqueCoupon(code: string, userId: string): Promise<GetCoupons> {
    const couponIsEligible = await this.couponIsEligible(code);

    if (!couponIsEligible) {
      throw Error(
        `Sorry but the coupon [${code}] is not eligible. it might be already used or expired. Please contact the sender of the coupon for further info.`
      );
    }

    await this.couponsServiceData.activateUniqueCoupon(code, userId);
    const coupon = await this.couponsServiceData.getOneCouponByCode(code);

    return coupon;
  }

  createCoupons(data: CouponsCreationDto): Promise<GetCoupons[]> {
    const { quantity } = data;
    const range = [...Array(quantity).keys()];

    const codes: string[] = range.map((i) => {
      return randomBytes(7).toString("hex");
    });

    const coupons = this.couponsServiceData.postCoupons(codes, data);
    return coupons;
  }
}

export default CouponsService;
