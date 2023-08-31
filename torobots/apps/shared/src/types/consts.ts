export const DEV_API_URL = "http://localhost:3000";
export const DEV_ENGINE_URL = "http://localhost:3001";
export const DEV_APP_URL = "http://localhost:3100";

export const PROD_API_URL = "https://api.torobot.org";
export const PROD_ENGINE_URL = "https://api.torobot.org";
export const PROD_APP_URL = "https://app.torobot.org";

export const urls = {
  api: {
    development: DEV_API_URL,
    production: PROD_API_URL,
  },
  engine: {
    development: DEV_ENGINE_URL,
    production: PROD_ENGINE_URL,
  },
  app: {
    development: DEV_APP_URL,
    production: PROD_APP_URL,
  },
};

type Stage = "production" | "development";

const stage = (process.env.NODE_ENV as Stage) || "development";

export const API_URL = urls.api[stage];
export const ENGINE_URL = urls.api[stage];
export const APP_URL = urls.app[stage];

export const APP_NAME = "ToroBot";

export const DEFAULT_MAX_TIMESTAMP_AGE = 30000;
export const MAX_NUM =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

export const STATUS_ACTIVE = "ACTIVE";
export const STATUS_INACTIVE = "INACTIVE";

export const STATUS_READY = "READY";
export const STATUS_PROCESSING = "PROCESSING";
export const STATUS_SUCCESS = "SUCCESS";
export const STATUS_ERROR = "ERROR";
export const STATUS_STOPPED = "STOPPED";

export const STATUS_LOADING = "LOADING";
export const STATUS_LOADED = "LOADED";

export const STATUS_CONNECTING = "CONNECTING";
export const STATUS_NOT_CONNECTED = "NOT_CONNECTED";
export const STATUS_CONNECTED = "CONNECTED";
export const STATUS_WAITING = "WAITING";

export const events = {
  init: "init",
  ready: "ready",
  updated: "updated",
  deleted: "deleted",
  started: "started",
  stopped: "stopped",
  finished: "finished",
  transaction: "transaction",
};

export const actions = {
  create: "create",
  retrieve: "retrieve",
  update: "update",
  delete: "delete",
};

export enum ECEXType {
  COINBASE = "COINBASE",
  KUCOIN = "KUCOIN"
};
