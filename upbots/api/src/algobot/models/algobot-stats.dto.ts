/* eslint-disable max-classes-per-file */
import { ApiProperty } from "@nestjs/swagger";

export default class AlgoBotStatsDto {
  @ApiProperty()
  ownerId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  botRef: string;

  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  totalRealisedUbxtGain: number;

  @ApiProperty()
  lastTradeAmount: number;

  @ApiProperty()
  openedTradeAmount: number;

  @ApiProperty()
  activatedAt?: Date;

  @ApiProperty()
  createdAt?: Date;

  @ApiProperty()
  updatedAt?: Date;
}
