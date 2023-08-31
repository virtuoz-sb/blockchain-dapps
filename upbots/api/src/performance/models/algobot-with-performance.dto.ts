/* eslint-disable max-classes-per-file */
import { ApiProperty } from "@nestjs/swagger";
import { PerformanceCycleDto, PerformanceSnapshotDto } from "./performance.models";
import { AlgoBotsDto } from "../../algobot/models/algobot.dto";

export class AlgoBotsWithPerformanceDto extends AlgoBotsDto {
  @ApiProperty()
  perfs: PerformanceCycleDto[];
}

export class AlgoBotsWithSnapShotPerformanceDto extends AlgoBotsDto {
  @ApiProperty()
  perfSnapshots: PerformanceSnapshotDto;

  @ApiProperty()
  followers?: number;

  @ApiProperty()
  position?: string;

  @ApiProperty()
  profitPercentage?: number;

  @ApiProperty()
  profitPercentageUC?: number;
}

export class MyTradeDto {
  @ApiProperty()
  botId: string;

  @ApiProperty()
  botName: string;

  @ApiProperty()
  exch: string;

  @ApiProperty()
  pair: any;

  @ApiProperty()
  open: boolean;

  @ApiProperty()
  openAt: Date;

  @ApiProperty()
  closeAt: Date;

  @ApiProperty()
  qExec: number;

  @ApiProperty()
  entryPrice: number;

  @ApiProperty()
  closePrice: number;

  @ApiProperty()
  realisedGain: any;

  @ApiProperty()
  performanceFee: any;

  @ApiProperty()
  profitPercentage: number;

  @ApiProperty()
  profitPercentageUC: number;

  @ApiProperty()
  cycleSequence: number;
}
