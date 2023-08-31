/* eslint-disable max-classes-per-file */

import { ApiProperty } from "@nestjs/swagger";

export class WithdrawDto {
  @ApiProperty()
  to: string;

  @ApiProperty({ description: "Amount to withdraw in WEI" })
  amount: string;
}

export class ClaimOrWithdrawResponse {
  @ApiProperty()
  transactionHash: string;

  @ApiProperty({ description: "Amount changed in WEI" })
  amount: string;
}

export class NeedsRefillResponse {
  @ApiProperty()
  message: "Needs refill";

  @ApiProperty()
  transactionHash: string;
}

export interface GasLimits {
  rebalance: [number, number];

  withdraw: [number, number];
}
