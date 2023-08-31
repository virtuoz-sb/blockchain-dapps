export interface TokenData {
  address: string;
  contractTickerSymbol: string;
  contractLogoUrl: string;
  balance: number;
  quote: number;
  blockchain: 'eth' | 'bsc'
}
