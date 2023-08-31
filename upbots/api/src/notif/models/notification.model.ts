import { Document } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { OrderEventData } from "./order-event.payload";
import Timestampable from "../../types/timestampable";

export default interface NotificationModel extends Document, Notification {
  isRead: boolean;

  isDeleted: boolean;
  deletedAt?: Date;
}

export interface Notification extends OrderEventData, Timestampable {}

export class NotificationDto implements Notification {
  @ApiProperty()
  isRead: boolean;

  @ApiProperty()
  exOrderId: string;

  @ApiProperty()
  orderTrack: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  side: string;

  @ApiProperty()
  sbl: string;

  @ApiProperty()
  exch: string;

  @ApiProperty()
  qOrig: string;

  @ApiProperty()
  qExec: string;

  @ApiProperty()
  qRem: string;

  @ApiProperty()
  qExecCumul: string;

  @ApiProperty()
  accountRef: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  pAsk: string;

  @ApiProperty()
  pExec: string;

  @ApiProperty()
  cumulQuoteCost: string;

  @ApiProperty()
  initiator: string;

  @ApiProperty()
  errorReason: string;

  @ApiProperty()
  botName: string;

  @ApiProperty()
  createdAt?: Date;

  @ApiProperty()
  updatedAt?: Date;
}
