interface Entry {
  marketentry: boolean;
  limitentry: boolean;
  triggerprice: string | number; // string or number?
  limitprice: string | number; // string or number?;
  quantity: string | number; // string or number?;
}

export interface Strategy {
  id: string;
  entries: Entry[];
  market: {
    exchange: string;
    symbol: string;
  };
  stopLoss: string;
  side: number;
  phase: number;
  takeProfits: [
    {
      quantity: string;
      trigger: string;
    }
  ];
  account: {
    userID: string;
    apiKeyID: string;
  };
  created_at: string;
  updated_at: string;
  phaseDescription: string;
  sideDescription: string;
}

export interface StrategyDetails {
  at: string;
  status: string;
  exOrderId: string;
  side: string;
  sbl: string;
  exch: string;
  price: string;
  qOrig: string;
  qExec: string;
  qRem: string;
}

export interface StrategyDetailsDto {
  id: string;
  stratId: string;
  ctx: string;
  type: 0;
  created_at: string;
  side: string;
  orderType: string;
  priceAsked: string;
  qtyAsked: string;
  sbl: string;
  exch: string;
  details: StrategyDetails[];
  updated_at: string;
}

export interface StrategyDetailsVuex {
  id: string;
  data: StrategyDetailsDto[];
}
