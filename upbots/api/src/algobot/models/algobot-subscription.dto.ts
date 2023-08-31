import { ApiProperty } from "@nestjs/swagger";
import { BotFeesTokens, BotFeesPlans, BotAccountType, BotStratType } from "./algobot-subscription.model";

export default class AlgobotsSubscriptionDto {
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
  feesToken: BotFeesTokens;

  @ApiProperty()
  feesPlan: BotFeesPlans;

  @ApiProperty()
  accountType: BotAccountType;

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
  positionType: string;

  @ApiProperty()
  positionAmount: number;

  @ApiProperty()
  accountLeverage: number;

  @ApiProperty()
  contractSize: number;

  @ApiProperty()
  baseAmount: number;

  @ApiProperty()
  openedQuantity: number;

  @ApiProperty()
  quote: string;

  @ApiProperty()
  accountAllocated: {
    maxamount: number;
    currency: string;
  };

  @ApiProperty()
  error?: string;

  @ApiProperty()
  errorAt?: Date;

  @ApiProperty()
  errorReason?: string;

  // TODO: maybe add a computed prop to indicate whether errorAt is recent (=== updatedAt)
}
