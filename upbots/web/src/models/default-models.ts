import { EntryFormItems, TargetFormItems, StopLossFormItems, AlertForm } from "@/models/interfaces";

export const orderOperationsDefault = (): any => ({
  entry: [],
  target: [],
  stopLoss: null,
});

export const entryModel = (): any => ({
  price: null,
  amount: null,
  selectedAdaptationsType: "limit",
  rangeValue: 33,
});

export const targetModel = (selectedType: any, targetTitle: any): any => ({
  targetPrice: "",
  orderPrice: "",
  triggerPrice: "",
  deviationPrice: "",
  selectedOrderType: selectedType,
  targetTitle: targetTitle,
  rangeValue: 20,
});

export const stopLossModel = (): any => ({
  deviationPrice: "",
  triggerPrice: "",
  orderPrice: "",
  rangeValue: 20,
});

export const alertModel = (): AlertForm => ({
  condition: { label: "BTC-10", value: "btc10" },
  crossing: { label: "Crossing", value: "crossing" },
  line: { label: "Horizontal Line", value: "horizontal" },
  option: { label: "Only Once", value: "once" },
  notificationType: { label: "SMS", value: "sms" },
  alertMessage: "",
  alertId: null,
  value: "",
});

export const walletChartOption = {
  lineTension: 0.4,
  borderWidth: 2,
  pointBorderWidth: 0,
  pointHoverRadius: 0,
  pointHoverBorderWidth: 0,
  pointRadius: 0,
  pointHitRadius: 0,
};

export const defaultExchangeForm = () => ({
  name: "",
  exchangeName: { img: require("@/assets/images/ftx.svg"), label: "FTX", alt: "ftx", value: "ftx" },
  publicKey: "",
  secretKey: "",
  password: "",
});

export const defaultBotEntryStopLossForm = () => ({
  stopLossValue: { value: "stopLoss", label: "Stop Loss" },
  entryPrice: "",
  percentageValue: "25",
});

export const defaultBotEntryTargetForm = () => ({
  limit: { value: "limit", label: "Limit" },
  targetType: { value: "takeProfit", label: "Take profit" },
  profit: "",
  percentageValue: "25",
});

export const defaultQueryFilterValues = (): any => ({
  languages: [],
  topics: [],
  levels: [],
  formats: [],
});

export const availableFilterCurrency = () => [
  { value: "eur", label: "EUR" },
  { value: "usd", label: "USD" },
];
