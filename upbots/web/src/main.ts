import Vue from "vue";
import App from "./App.vue";
import VueGtag from "vue-gtag";
import router from "./router";
import store from "./store";
import socketInstance from "./socket-instance";

import "@/registerServiceWorker"; // disable PWA
import "@/core/filters";
import "@/core/directives/loading-box-generator-derective";
import "@/core/directives/lazy-load-directive";
import "@/plugins";
import "@/core/app-validation-rules";

import "@/register-global-components";
import "@/assets/scss/main.scss";
import "vue-select/dist/vue-select.css";

import $http from "@/core/api.config";
import Breakpoint from "@/services/breakpoints";
import Notifications from "vue-notification";
import vSelect from "vue-select";
import VuePortal from "@linusborg/vue-simple-portal";
import VueSocketIOExt from "vue-socket.io-extended";
import vuescroll from "vuescroll";
import Zendesk from "@dansmaculotte/vue-zendesk";
import { emptySvgTemplate } from "@/core/helper-functions";

Vue.use(Zendesk, {
  key: "a8559a18-9268-4b64-86e4-7b139c02b99e",
  disabled: true,
  settings: {
    webWidget: {
      color: {
        theme: "#27ADC5",
        launcherText: "#FFFFFF",
      },
      offset: {
        horizontal: "5px",
        vertical: "65px",
      },
      zIndex: 999999,
    },
  },
});

Vue.use(Notifications);
Vue.use(VuePortal);

Vue.use(VueSocketIOExt, socketInstance, { store });

// You can set global config here.
Vue.use(vuescroll, { name: "customScroll" });

// Google Analytics
Vue.use(
  VueGtag,
  {
    config: {
      id: process.env.VUE_APP_GA_ID,
    },
  },
  router
);

// Vue Select
Vue.component("v-select", vSelect);

// configurations and injections
Vue.config.productionTip = false;
Vue.prototype.$breakpoint = Vue.observable(Breakpoint);
Vue.prototype.$http = $http;
Vue.prototype.$emptySvgTemplate = emptySvgTemplate;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
