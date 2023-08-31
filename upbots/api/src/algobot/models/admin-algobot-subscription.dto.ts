import { ApiProperty } from "@nestjs/swagger";
import { BotStratType } from "./admin-algobot-subscription.model";

export default class AdminAlgobotsSubscriptionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  botId: string;

  @ApiProperty()
  apiKeyRef: string;

  @ApiProperty()
  enabled: boolean;

  @ApiProperty()
  isOwner: boolean;

  @ApiProperty()
  botRunning: boolean;

  @ApiProperty()
  stratType: BotStratType;

  @ApiProperty()
  createdAt?: Date;

  @ApiProperty()
  updatedAt?: Date;

  @ApiProperty()
  cycleSequence: number;

  @ApiProperty()
  status: number; // 0 notset 1: pendingOpen, 2 pendingClose 3: Open 4:Close 5 OnError

  @ApiProperty()
  accountPercent: number;

  @ApiProperty()
  error?: string;

  @ApiProperty()
  errorAt?: Date;

  @ApiProperty()
  errorReason?: string;

  @ApiProperty()
  user?: string;
}
