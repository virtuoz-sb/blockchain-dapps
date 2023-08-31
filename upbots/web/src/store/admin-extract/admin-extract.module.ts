import { Module } from "vuex";
import { getters } from "./admin-extract.getters";
import { actions } from "./admin-extract.actions";
import { mutations } from "./admin-extract.mutations";
import { AxiosResponse } from "axios";
import { RootState } from "../root.store";
import { UbxtLockedOwnerList, CouponPayload } from "./types/admin-extract.payload";

const namespaced: boolean = true; // when true, avoids action name collision between different modules

export interface AdminExtractState {
  error: AxiosResponse;
  ubxtlockedOwnerList: UbxtLockedOwnerList;
  coupons: String[];
  couponPayload: CouponPayload;
}
export const state: AdminExtractState = {
  error: null,
  ubxtlockedOwnerList: {} as any,
  coupons: [],
  couponPayload: {} as any,
};
export const adminExtractModule: Module<AdminExtractState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
