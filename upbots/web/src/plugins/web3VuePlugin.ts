/*
import _Vue, { PluginObject } from "vue";
import Web3 from "web3";
import { Provider } from "web3/providers";

export const Web3Plugin: PluginObject<any> = {
  install: (Vue: typeof _Vue, options?: any) => {
    let instance: Web3 = new Web3(Web3.givenProvider);
    // Vue.prototype.$notify = app.notify;
    Vue.prototype.$web3 = instance;
    Vue.prototype.$web3.metaProvider = Web3.givenProvider as MetaProvider;
  },
};

// this is to type the $web3 injected by this plugin so that components view it as typed.
declare module "vue/types/vue" {
  interface Vue {
    $web3: MetaWeb3;
  }
}
interface MetaWeb3 extends Web3 {
  metaProvider: MetaProvider;
}
interface MetaProvider extends Provider {
  enable(): Promise<any>;
  on(type: string, callback: (accounts: any) => void): MetaProvider;
  autoRefreshOnNetworkChange: boolean;
}
*/
