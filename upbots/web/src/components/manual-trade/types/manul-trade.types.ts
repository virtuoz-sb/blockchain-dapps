export type TNullableField<T> = T | null;
export interface EntryForm {
  price: number;
  amount: number;
  rangeValue: number;
  isMarket?: boolean;
  isLimit?: boolean;
  totalValue?: number;
}

export interface OrderOperations {
  entry: Array<EntryForm>;
  target: any;
  stopLoss: any;
}

export interface IMyOrder {
  userId: string;
  exchKeyId: string;
  created_at: string;
  updated_at: string;
  side: string;
  orderType: string;
  priceAsked: any;
  qtyBaseAsked: any;
  qtyQuoteAsked: TNullableField<any>;
  sbl: string;
  exch: string;
  initiator: string;
  aborted: boolean;
  completed: boolean;
  errorAt?: string;
  errorReason?: string;
  completion?: any;
  id: string;
  userOrderStatus: string;
  accountName: string;
  baseCurrency: string;
  quoteCurrency: string;
}
