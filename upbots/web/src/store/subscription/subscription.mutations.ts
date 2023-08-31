import { MutationTree } from "vuex";
import { AxiosResponse } from "axios";
import { SubscriptionState, Subscription } from "./subscription.module";

// mutation types:
export const SUBSCRIPTION_GET_BEGIN = "SUBSCRIPTION_GET_BEGIN";
export const SUBSCRIPTION_GET_SUCCESS = "SUBSCRIPTION_GET_SUCCESS";
export const SUBSCRIPTION_GET_ERROR = "SUBSCRIPTION_GET_ERROR";
// mutations are synchronous functions that update the state (akin to redux reducers..)
export const mutations: MutationTree<SubscriptionState> = {
  [SUBSCRIPTION_GET_BEGIN]: function (state: SubscriptionState) {
    state.loading = true;
  },
  [SUBSCRIPTION_GET_SUCCESS]: function (state: SubscriptionState, response: Subscription) {
    state.loading = true;
    state.transactions = response.transactions;
    state.error = null;
  },
  [SUBSCRIPTION_GET_ERROR]: function (state: SubscriptionState, error: AxiosResponse) {
    state.loading = false;
    state.error = error;
  },
};
