/* eslint-disable max-classes-per-file */
/* eslint-disable import/prefer-default-export */
import { ApiProperty } from "@nestjs/swagger";

class Owners {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;
}

export class GetCurrencyOwnersDto {
  @ApiProperty()
  currency: string;

  @ApiProperty()
  ownersCount: number;

  @ApiProperty()
  failures: number;

  @ApiProperty()
  countingDate: Date;

  @ApiProperty({ type: [Owners] })
  owners: Owners[];
}
