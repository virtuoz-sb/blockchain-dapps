import { ActionTree } from "vuex";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { SubscriptionState, Subscription } from "./subscription.module";
import { SUBSCRIPTION_GET_BEGIN, SUBSCRIPTION_GET_SUCCESS, SUBSCRIPTION_GET_ERROR } from "./subscription.mutations";
import { RootState } from "../root.store";

export const actions: ActionTree<SubscriptionState, RootState> = {
  fetchTransactions({ commit }): void {
    let url = "/api/transactions";
    let config: AxiosRequestConfig = {
      params: { sortOrder: "asc", pageNumber: 0, pageSize: 100 },
    };
    commit(SUBSCRIPTION_GET_BEGIN);
    axios
      .get<Subscription>(process.env.VUE_APP_ROOT_API + url, config)
      .then((response) => {
        const res = response && response.data;
        commit(SUBSCRIPTION_GET_SUCCESS, res);
      })
      .catch((error: AxiosError) => {
        const res = error && error.response && error.response.data;
        commit(SUBSCRIPTION_GET_ERROR, res);
      });
  },
};
