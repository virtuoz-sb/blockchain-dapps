import { ApiProperty } from "@nestjs/swagger";
import { OrderTrackingDto } from "../../trade/model/order-tracking.dto";

export default class AlgobotsSubscriptionAuditDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  botId: string;

  @ApiProperty()
  botSubId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  oTrackId: OrderTrackingDto;

  @ApiProperty()
  accountPercent: number;

  @ApiProperty()
  positionType: string;

  @ApiProperty()
  positionAmount: number;

  @ApiProperty()
  status: number; // subscription status at the moment the signal was received

  @ApiProperty()
  position: string;

  @ApiProperty()
  followed: boolean;

  @ApiProperty()
  cycleSequence: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  error: string;

  @ApiProperty()
  errorReason: string;

  @ApiProperty()
  errorAt: Date;

  @ApiProperty()
  signalId: string;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  exchange: string;

  @ApiProperty()
  balance: number;
}
