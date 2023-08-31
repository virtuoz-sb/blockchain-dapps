import { Module } from "vuex";
import { getters } from "./subscription.getters";
import { actions } from "./subscription.actions";
import { mutations } from "./subscription.mutations";
import { AxiosResponse } from "axios";
import { RootState } from "../root.store";

export interface Transaction {
  _id: string;
  txn_id: string;
  currency1: string;
  currency2: string;
  amount: number;
  buyer_email: string;
  address: string;
  buyer_name: string;
  item_name: string;
  item_number: string;
  invoice: string;
  custom: string;
  ipn_url: string;
  success_url: string;
  cancel_url: string;
  status: string;
  fraud: boolean;
  date: string;
  response: string;
  checkout_url: string;
  status_url: string;
  cp_status: number;
  cp_status_text: string;
  logtime: string;
}

export interface SubscriptionState {
  loading: boolean;
  error: AxiosResponse | null;
  transactions: Transaction[];
}

export const state: SubscriptionState = {
  loading: false,
  error: null,
  transactions: [],
}; // init state

const namespaced: boolean = true; // when true, avoids action name collision between different modules

// this is the module name (important for vuex namespacing)
export const subscriptionModule: Module<SubscriptionState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
export interface SubscriptionPayload {
  transaction: Transaction;
}

export interface Subscription {
  transactions: Transaction[];
}
