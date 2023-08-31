import axios, { AxiosError } from "axios";
import store from "@/store";
import router from "@/router";

/* List of endpoints that will not be taken into consideration for on/off loading prop */
const omit = [
  "/api/orderbook",
  "/api/tradehistory",
  "/api/trade",
  "/api/cryptoPrice",
  "/api/price",
  "/api/custodial-wallets/ubxt",
  "/api/custodial-wallets/rebalance",
  "/api/custodial-wallets/rebalance",
  "/api/settings/exchanges",
  "/api/portfolio/filter",
  "/api/portfolio/evolution",
];

/* Define Axios instance */
const $http = axios.create({
  baseURL: process.env.VUE_APP_ROOT_API,
});

/* Handle Vuex loading property - Application Loading Indicator */
let requestsCounter = 0;
const requestLoadingHandler = ({ url }: any, type: string) => {
  const shouldOmit = omit.some((omitUrl) => url.startsWith(omitUrl));
  if (shouldOmit) return;

  if (type === "start") {
    requestsCounter++;
    if (requestsCounter === 1) {
      store.commit("isLoading", true);
    }
  } else if (type === "end") {
    requestsCounter--;
    if (requestsCounter <= 0) {
      store.commit("isLoading", false);
    }
  }
};

/* Handle 401 status in order to redirect the user to login page */
const handleUnauthorizedResponse = ({ config, response }: any) => {
  const handleTokenExpiredRedirect = config.url && !config.url.includes("/api/auth/login"); //deny 401 redirect if login on going
  if (response.status === 401 && handleTokenExpiredRedirect) {
    // GA Event
    (window as any).gtag("event", "logout", {
      event_category: "user_auto_logout",
      event_label: "Log Out",
      non_interaction: true,
    });

    router.push("/login").catch((err: any) => {
      // eslint-disable-next-line no-console
      console.log("logoutAfterTokenExpired ROUTER ERROR: ", err);
    });
  }
};

$http.interceptors.request.use(
  (config) => {
    requestLoadingHandler(config, "start");

    /* Set authorization token to request header */
    const token = store.getters["authModule/getJwt"];
    if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error: AxiosError) => {
    const { config } = error;

    requestLoadingHandler(config, "end");
    return Promise.reject(error);
  }
);

$http.interceptors.response.use(
  (response) => {
    requestLoadingHandler(response.config, "end");

    return response;
  },
  (error: AxiosError) => {
    const { response, config } = error;
    requestLoadingHandler(config, "end");

    handleUnauthorizedResponse({ response, config });
    if (response.data.message === "Unauthorized") {
      return null;
    }
    return Promise.reject(error);
  }
);

export default $http;
