export interface MultiValue {
  [key: string]: string;
}

export enum ETradingInitiator {
  ALL = "ALL",
  BOT = "BOT",
  DIRECT = "DIRECT",
  AUTO = "AUTO",
  VOLUME = "VOLUME",
  LIQUIDATOR = "LIQUIDATOR"
}

export enum ETradingThread {
  NONE = "NONE",
  
  APPROVING_BUY = "APPROVING_BUY",
  APPROVING_SELL = "APPROVING_SELL",

  BUYING_INSTANT = "BUYING_INSTANT",
  BUYING_SPAM = "BUYING_SPAM",
  BUYING_EVENT = "BUYING_EVENT",

  SELLING_INSTANT = "SELLING_INSTANT",
  SELLING_SPAM = "SELLING_SPAM",
  SELLING_TIMER = "SELLING_TIMER",
  
  ANTI_SELL_DETECTED = "ANTI_SELL_DETECTED",
  RUG_POOL_DETECTED = "RUG_POOL_DETECTED",
  SELLING_STOP_LOSS = "SELLING_STOP_LOSS",

  AUTO_SENDING_COIN_TO_NEW_WALLET = "SENDING_COIN_TO_NEW_WALLET",                 // step 0
  AUTO_SENDING_BASETOKEN_TO_NEW_WALLET = "SENDING_BASETOKEN_TO_NEW_WALLET",       // step 1
  AUTO_APPROVE_PRE_BUYING = "APPROVE_PRE_BUYING",                                 // step 2
  AUTO_PRE_BUYING = "PRE_BUYING",                                                 // step 3
  AUTO_APPROVE_PRE_SELLING = "APPROVE_PRE_SELLING",                               // step 4
  AUTO_PRE_SELLING = "PRE_SELLING",                                               // step 5
  AUTO_APPROVE_BUYING = "APPROVE_BUYING",                                         // step 6
  AUTO_BUYING = "BUYING",                                                         // step 7
  AUTO_APPROVE_SELLING = "APPROVE_SELLING",                                       // step 8
  AUTO_SELLING = "SELLING",                                                       // step 9
  AUTO_FINISHED = "AUTO_FINISHED"                                                 // step 10
}

export enum ERunningStatus {
  DRAFT = "DRAFT",
  RUNNING = "RUNNING",
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED",
  STOPPED = "STOPPED",
  ARCHIVED = "ARCHIVED"
}