export interface DexagRequest {
  to: string;
  from: string;
  toAmount?: number;
  limitAmount: number;
  discluded?: string;
  dex: "all";
}

export interface ExchangeData {
  id: string;
  checked: boolean;
  label: string;
}

export interface TableColumn {
  dex: string;
  name: string;
  nameDesc?: string;
  price: string;
  total: string;
  markup: string;
}

export interface SwapState {
  pending: boolean;
  error?: string;
  provider: "DEX.AG";
  providerSdk: any;
  providerRequest: DexagRequest;
  walletConnected: boolean;
  exchangesData: ExchangeData[];
  tableData: TableColumn[];
}
