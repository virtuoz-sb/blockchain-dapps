export interface GroupItems<valueT = string | number, labelT = string> {
  value: valueT;
  label: labelT;
}

export interface OrderOperationOptions {
  entryPrice: string | number;
  amount: string | number;
  totalValue: string | number;
  selectedLimitType: GroupItems;
  selectedMarketType: GroupItems;
  selectedOrderType: GroupItems;
  selectedQuantity: number;
  optionId: number;
  currentPrice: number;
  selectedAsset: string;
}

export interface OrderItems {
  form: OrderOperationOptions;
  recap: any;
}

export interface OrderOperation {
  orderType: string;
  amount: string | number;
  Quantity: string | number;
}

export interface Tab {
  value: string;
  componentName?: string;
  createdOperations?: OrderOperation[];
}

export interface EntryFormItems {
  entryPrice: any;
  amount: any;
  totalValue: number | null;
  selectedLimitType: GroupItems;
  selectedMarketType: GroupItems;
  selectedOrderType: GroupItems;
  selectedQuantity: number | null;
  optionId: any;
}

export interface TargetFormItems {
  targetPrice: string;
  orderPrice: string;
  triggerPrice: string;
  deviationPrice: string;
  selectedOrderType: GroupItems;
  selectedQuantity: string;
}

export interface StopLossFormItems {
  deviationPrice: string;
  triggerPrice: string;
  orderPrice: string;
  selectedOrderType: GroupItems;
  selectedQuantity: string;
}

export interface AlertForm {
  condition: GroupItems;
  crossing: GroupItems;
  line: GroupItems;
  option: GroupItems;
  notificationType: GroupItems;
  alertMessage: string;
  alertId: number | null;
  value: string;
}

export interface OrderBookData {
  asks: [number, number];
  bids: [number, number];
  seqNum?: number;
}

export interface AllowanceData {
  account: string;
  cost: number;
  remaining: number;
  remainingPaid: number;
}

export interface OrderBookResponse {
  allowance: AllowanceData;
  result: OrderBookData;
}

export interface IOrderBookItem {
  id: number;
  amount: number;
  price: number;
  total: number;
  progressBarColor: string;
}
