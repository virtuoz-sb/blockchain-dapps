import { ActionTree } from "vuex";
import { AxiosError } from "axios";
import moment from "moment";
import {
  GET_UBXT_LOCKED_OWNER_LIST_SUCCESS,
  GET_UBXT_LOCKED_OWNER_LIST_ERROR,
  GET_COUPON_PAYLOAD,
  GET_COUPON_LIST_SUCCESS,
  GET_COUPON_LIST_ERROR,
} from "./admin-extract.mutations";
import { CouponPayload } from "./types/admin-extract.payload";
import $http from "@/core/api.config";

export const actions: ActionTree<any, any> = {
  fetchOwners({ commit }) {
    const url = "/api/support/staking/ubxt_locked";
    return $http
      .get(url)
      .then((response) => {
        const res = response && response.data;
        commit(GET_UBXT_LOCKED_OWNER_LIST_SUCCESS, res);
      })
      .catch((error: AxiosError) => {
        const res = error && error.response && error.response.data;
        commit(GET_UBXT_LOCKED_OWNER_LIST_ERROR, res);
      });
  },
  setCouponPayload({ commit }, payload: Partial<CouponPayload>) {
    const validFromTimeStamp = moment(payload.validFrom.toString()).valueOf();
    const validToTimeStamp = moment(payload.validTo.toString()).valueOf();
    const setPayload = {
      ...payload,
      validFrom: validFromTimeStamp,
      validTo: validToTimeStamp,
    };
    commit(GET_COUPON_PAYLOAD, setPayload);
  },
  createCoupons({ commit }, payload: Partial<CouponPayload>) {
    const url = "/api/coupons";
    return $http
      .post<CouponPayload>(url, payload)
      .then((response) => {
        const res = response && response.data;
        commit(GET_COUPON_LIST_SUCCESS, res);
      })
      .catch((error: AxiosError) => {
        const res = error && error.response && error.response.data;
        commit(GET_COUPON_LIST_ERROR, res);
      });
  },
};
