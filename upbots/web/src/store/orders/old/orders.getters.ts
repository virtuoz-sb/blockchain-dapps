import { GetterTree } from "vuex";
import { RootState } from "../../root.store";
import { OrderState } from "./orders.module";

//TODO: clean unused
export const getters: GetterTree<OrderState, RootState> = {
  orderBuy(state) {
    return state.orders.filter((el: any) => el.orderType === "buy");
  },
  orderSell(state) {
    // TODO: implement MyOrders (specs required)
    return state.orders.filter((el: any) => el.orderType === "sell");
  },
  quoteAsset(state) {
    return state.currentAssets.value.split("/")[0];
  },
  baseAsset(state) {
    return state.currentAssets.value.split("/")[1];
  },
  selectedAssetPair(state) {
    return state.currentAssets.value;
  },

  longStrategies(state) {
    return state.strategies.filter((s) => s.sideDescription === "long");
  },
  shortStrategies(state) {
    return state.strategies.filter((s) => s.sideDescription === "short");
  },
};
