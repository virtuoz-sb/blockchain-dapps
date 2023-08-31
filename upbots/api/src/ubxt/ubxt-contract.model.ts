/* eslint-disable max-classes-per-file */

import { ApiProperty } from "@nestjs/swagger";

class SerializedBN {
  @ApiProperty()
  raw: string;

  @ApiProperty()
  value: string;
}

export default class TokenCirculation {
  @ApiProperty()
  supply: SerializedBN;

  @ApiProperty()
  available: SerializedBN;

  @ApiProperty()
  burned: SerializedBN;

  @ApiProperty()
  staked: SerializedBN;
}

class UbxtEx {
  @ApiProperty()
  finalPriceUbxt: 0;

  @ApiProperty()
  lpStakedTotal: 0;

  tokenPerBlock: 0;

  @ApiProperty()
  totalAllocPoint: 0;

  @ApiProperty()
  ubxtBalance: 0;

  @ApiProperty()
  totalSupply: 0;

  @ApiProperty()
  burntAmount: 0;

  @ApiProperty()
  ubxtStaked: 0;

  @ApiProperty()
  totalUbxt: 0;

  @ApiProperty()
  balance: 0;

  @ApiProperty()
  totalLp: 0;

  @ApiProperty()
  farmAPY: 0;

  @ApiProperty()
  lpFarmAPY: 0;
}

export class UbxtStakingData {
  @ApiProperty()
  eth: UbxtEx;

  @ApiProperty()
  bsc: UbxtEx;
}

export class TotalSupplyData {
  @ApiProperty()
  value: string;

  @ApiProperty()
  rounded: string;
}
