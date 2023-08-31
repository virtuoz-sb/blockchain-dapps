export interface IMyExchangeKey {
  id: string;
  name: string;
  created: Date;
  exchange: string;
  publicKey: string;
  valid: boolean;
  lastHealthCheck: Date;
  updated: Date;
}
