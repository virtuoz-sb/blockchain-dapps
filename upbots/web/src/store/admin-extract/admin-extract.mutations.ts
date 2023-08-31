import { MutationTree } from "vuex";
import { AxiosResponse } from "axios";
import { AdminExtractState } from "./admin-extract.module";
import { UbxtLockedOwnerList, CouponPayload } from "./types/admin-extract.payload";

export const GET_UBXT_LOCKED_OWNER_LIST_SUCCESS = "GET_UBXT_LOCKED_OWNER_LIST_SUCCESS";
export const GET_UBXT_LOCKED_OWNER_LIST_ERROR = "GET_UBXT_LOCKED_OWNER_LIST_ERROR";
export const GET_COUPON_PAYLOAD = "GET_COUPON_PAYLOAD";
export const GET_COUPON_LIST_SUCCESS = "GET_COUPON_LIST_SUCCESS";
export const GET_COUPON_LIST_ERROR = "GET_COUPON_LIST_ERROR";

export const mutations: MutationTree<AdminExtractState> = {
  [GET_UBXT_LOCKED_OWNER_LIST_SUCCESS]: (state: AdminExtractState, ubxtlockedOwnerList: UbxtLockedOwnerList) => {
    state.error = null;
    state.ubxtlockedOwnerList = ubxtlockedOwnerList;
  },
  [GET_UBXT_LOCKED_OWNER_LIST_ERROR]: (state: AdminExtractState, error: AxiosResponse) => {
    state.error = error;
  },
  [GET_COUPON_PAYLOAD]: (state: AdminExtractState, couponPayload: CouponPayload) => {
    state.error = null;
    state.couponPayload = couponPayload;
  },
  [GET_COUPON_LIST_SUCCESS]: (state: AdminExtractState, coupons: []) => {
    state.error = null;
    state.coupons = coupons;
  },
  [GET_COUPON_LIST_ERROR]: (state: AdminExtractState, error: AxiosResponse) => {
    state.error = error;
  },
};
