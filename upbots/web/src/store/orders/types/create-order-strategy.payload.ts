// export default interface CreateOrderStrategyPayload {
//   /** strategy identifier (from backend). null if not created yet */
//   id: string;
// }

export enum OrderType {
  LIMIT = "LIMIT",
  MARKET = "MARKET",
}

export enum OrderSideType {
  BUY = "BUY",
  SELL = "SELL",
}

// should mirror front types
export class EntryDto {
  isLimit: boolean;

  isMarket: boolean;

  triggerPrice: number; // the entry condition price

  price?: number; // the price for limit order (ignored when isMarket is true)

  quantity: number;
}

export interface StrategyOrderCreationResponse {
  id: string;
}
export class CreateStrategyOrderDto {
  exchange: string;
  apiKeyRef: string;
  symbol: string;
  side: OrderSideType;
  // entryRange: EntryRange;
  entries: EntryDto[];
  quantity: number;
  takeProfits: TakeProfitDto[];
  stopLoss: number; // SL price
}

export class TakeProfitDto {
  triggerPrice: number;
  quantity: number;
  // TODO: add orderPrice
}
