import { ApiProperty } from "@nestjs/swagger";
import { TokenData } from "./TokenData.d";

export default class BalancesDto {
  @ApiProperty()
  addressList: string[];

  @ApiProperty()
  quoteCurrency: "usd";

  @ApiProperty()
  quoteCurrencyConversionRates: {
    btc: number;
    eur: number;
  };

  @ApiProperty()
  tokens: TokenData[];
}
