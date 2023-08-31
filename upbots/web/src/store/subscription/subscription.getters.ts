import { GetterTree } from "vuex";
import { RootState } from "../root.store";
import { SubscriptionState, Transaction } from "./subscription.module";

export const getters: GetterTree<SubscriptionState, RootState> = {
  getTransactions(state): Transaction[] {
    return state.transactions;
  },
};
