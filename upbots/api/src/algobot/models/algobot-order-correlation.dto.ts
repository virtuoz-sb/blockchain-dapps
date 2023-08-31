/* eslint-disable max-classes-per-file */
import { ApiProperty } from "@nestjs/swagger";
import AlgobotsSubscriptionDto from "./algobot-subscription.dto";

export class OrderTrackingRawDtoForAdmin {
  // _id: string;
  @ApiProperty()
  id: string;

  @ApiProperty()
  botId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  exchKeyId: string;

  @ApiProperty()
  botSubId: string;

  @ApiProperty()
  stratId: string;

  @ApiProperty()
  ctx: string;

  @ApiProperty()
  ctxBot: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty()
  side: string;

  @ApiProperty()
  orderType: string;

  @ApiProperty()
  priceAsked: string;

  @ApiProperty()
  qtyBaseAsked: string;

  @ApiProperty()
  qtyQuoteAsked?: any;

  @ApiProperty()
  sbl: string;

  @ApiProperty()
  exch: string;

  @ApiProperty()
  initiator: string;

  @ApiProperty()
  aborted: boolean;

  @ApiProperty()
  completed: boolean;

  @ApiProperty()
  cycleSequence: number;

  @ApiProperty()
  signalId: string;

  @ApiProperty()
  completion: any; // Completion;

  @ApiProperty()
  events: Array<any>; // Event[];

  @ApiProperty()
  error?: string;

  @ApiProperty({ required: false })
  errorReason?: string;

  @ApiProperty({ required: false })
  errorAt?: Date;
}

export class AlgobotOrderCorrelationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  privateSignal: boolean;

  @ApiProperty()
  engineSuccess: boolean;

  @ApiProperty()
  engineStatusCode: number;

  @ApiProperty()
  ipAddresses: string[];

  @ApiProperty()
  signalCorrelation: string;

  @ApiProperty()
  successes: number;

  @ApiProperty()
  followers: number;

  @ApiProperty()
  failures: number;

  @ApiProperty()
  execTime: number;

  @ApiProperty()
  botId: string;

  @ApiProperty()
  position: string;

  @ApiProperty()
  botCycle: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // __v: number;

  @ApiProperty()
  botsub: AlgobotsSubscriptionDto;

  @ApiProperty()
  order: OrderTrackingRawDtoForAdmin;
}
