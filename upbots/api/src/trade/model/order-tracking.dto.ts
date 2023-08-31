/* eslint-disable max-classes-per-file */
/* eslint-disable import/prefer-default-export */
import { ApiProperty } from "@nestjs/swagger";
import UserFriendlyOrderStatus from "./order-status-user";

export class CompletionEntity {
  @ApiProperty()
  qExec: number;

  @ApiProperty()
  pExec: number;

  @ApiProperty()
  cumulQuoteCost: number;
}
/**
 * Upbots order view-model: a read-only model on order trackings for a given price-driven strategy or algobot order or manual trade.
 */
export class OrderTrackingDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false })
  stratId?: string;

  @ApiProperty({ required: false })
  botId?: string;

  @ApiProperty({ required: false })
  botSubId?: string;

  @ApiProperty({ required: false })
  cycleSequence?: number;

  @ApiProperty({ type: [CompletionEntity], required: false })
  completion?: CompletionEntity;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  exchKeyId: string;

  @ApiProperty()
  signalId: string;

  @ApiProperty({ required: false })
  ctx?: string;

  @ApiProperty({ required: false })
  ctxBot?: string;

  @ApiProperty({ required: false })
  stratType?: string; // LONG, SHORT

  @ApiProperty()
  side: string;

  @ApiProperty()
  orderType: string;

  @ApiProperty()
  priceAsked: string;

  @ApiProperty()
  qtyAsked: string;

  @ApiProperty()
  sbl: string;

  @ApiProperty()
  exch: string;

  // @ApiProperty({ example: "algobot|direct" })
  @ApiProperty()
  initiator: string;

  // @ApiProperty({ type: [OrderEventSubDoc] })
  // events: OrderEventSubDoc[]; //hidden

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty()
  error?: string;

  @ApiProperty({ required: false })
  errorReason?: string;

  @ApiProperty({ required: false })
  errorAt?: Date;

  @ApiProperty({ enum: UserFriendlyOrderStatus })
  userOrderStatus: UserFriendlyOrderStatus;
}
