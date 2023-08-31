import { ApiProperty } from "@nestjs/swagger";
import { MeasuredObjects, Period } from "./performance.models";

export default class AdminPerformanceCycleDto {
  @ApiProperty()
  openAt: Date;

  @ApiProperty()
  botId?: string;

  @ApiProperty()
  subBotId?: string;

  @ApiProperty()
  userId?: string;

  @ApiProperty()
  measuredObject: MeasuredObjects;

  @ApiProperty({ type: Period })
  openPeriod: Period;

  @ApiProperty()
  closeAt?: Date;

  @ApiProperty({ type: Period })
  closePeriod: Period;

  @ApiProperty()
  stratType: string;

  @ApiProperty()
  result: string;

  @ApiProperty()
  cycleSequence: number;

  @ApiProperty()
  open: boolean;

  @ApiProperty()
  sbl: string;

  @ApiProperty()
  exch: string;

  @ApiProperty()
  profitPercentage?: number;

  @ApiProperty()
  entryPrice: number;

  @ApiProperty()
  closePrice?: number;

  @ApiProperty()
  user?: string;

  @ApiProperty()
  subcription?: string;

  @ApiProperty()
  bot?: string;
}
