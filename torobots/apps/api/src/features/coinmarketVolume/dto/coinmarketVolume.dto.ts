import { ICoinMarketVolume } from "@torobot/shared";

export class CoinMarketVolumeDto implements ICoinMarketVolume {
  token: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: Date;
}
