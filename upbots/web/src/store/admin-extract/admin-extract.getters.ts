import { GetterTree } from "vuex";
import { RootState } from "../root.store";
import { AdminExtractState } from "./admin-extract.module";
import { UbxtLockedOwnerList } from "./types/admin-extract.payload";
import moment from "moment";

export const getters: GetterTree<AdminExtractState, RootState> = {
  getUBXTOwners(state): UbxtLockedOwnerList {
    return state.ubxtlockedOwnerList;
  },
  generateInputCSVOwners(state) {
    const arrHeader: string[] = ["failures", "currency", "ownersCount", "countingDate", "id", "email"];
    const arrInfo = Object.values(state.ubxtlockedOwnerList).filter((value) => value instanceof Object == false);
    const arrOwners = state.ubxtlockedOwnerList.owners.map((owner) => [owner.id, owner.email]);
    let arrRow = arrOwners.map((row: String[]) => [...Array(arrInfo.length).fill(null), ...row]);
    arrRow[0] = arrRow.length > 0 ? [...arrInfo, ...arrRow[0].filter(Boolean)] : arrInfo;
    return { arrHeader: arrHeader, arrRow: arrRow, fileName: `UBXT_Locked-${moment().format("YYYY-MM-DD")}` };
  },
  getCouponPayload(state) {
    return state.couponPayload;
  },
  generateInputCSVCoupons(state) {
    const arrHeader = Object.keys(state.coupons[0]);
    const arrRow = state.coupons.map((data) => Object.entries(data).map(([_, value]) => value));
    return { arrHeader: arrHeader, arrRow: arrRow, fileName: `Coupons-${moment().format("YYYY-MM-DD")}` };
  },
};
