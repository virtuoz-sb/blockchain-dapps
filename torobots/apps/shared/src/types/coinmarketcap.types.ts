import { 
  IStoredToken,
} from ".";

export interface ICoinMarketVolume {
  token: string | IStoredToken;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: Date;
  created?: Date
}
