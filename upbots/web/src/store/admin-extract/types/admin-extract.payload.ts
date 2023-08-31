export interface UbxtLockedOwnerList {
  failures: Number;
  currency: String;
  ownersCount: Number;
  owners: [{ id: String; email: String }];
  countingDate: String;
}

export interface CouponPayload {
  promoName: String;
  description: String;
  couponType: String;
  quantity: Number;
  validFrom: String;
  validTo: String;
}
