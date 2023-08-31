/* eslint-disable max-classes-per-file */
import { ApiProperty } from "@nestjs/swagger";
import { AlgobotFees, PerfFees } from "./algobot.model";

export class AlgoBotsDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  botVer: string;

  @ApiProperty()
  description: string;

  // @ApiProperty()
  // symbol: string; //do not expose as it's value is different from exchange to exchange

  @ApiProperty()
  base: string;

  @ApiProperty()
  quote: string;

  @ApiProperty()
  stratDesc?: string;

  @ApiProperty()
  stratType: string; // LONG SHORT; LONG_SHORT

  @ApiProperty()
  category: string; // algobot, copybot, userbot

  @ApiProperty()
  ownerId: string;

  @ApiProperty()
  createdAt?: Date;

  @ApiProperty()
  updatedAt?: Date;

  @ApiProperty()
  creator: string;

  @ApiProperty()
  picture: {
    mimetype: string;
    data: string;
  };

  @ApiProperty()
  avgtrades: number;

  @ApiProperty()
  lastMonthTrades: number;

  @ApiProperty()
  allocatedMaxAmount: number;

  @ApiProperty()
  allocatedCurrency: string;

  @ApiProperty()
  ratings: number;

  @ApiProperty()
  raters?: { id: string; user: string; vote: number; comment: string; reviewedAt: Date }[];

  @ApiProperty()
  reviewerName: string;

  @ApiProperty()
  reviewerImg: string;

  @ApiProperty()
  reviewerBotRating: number;

  @ApiProperty()
  botRef: string;

  @ApiProperty()
  botFees?: AlgobotFees;

  @ApiProperty()
  perfFees: PerfFees;

  @ApiProperty()
  realOwnerId?: string;

  @ApiProperty()
  exchangesType: string[];

  @ApiProperty()
  priceDecimal: number;

  webhook: {
    exitTrigger: boolean;
  };
}

export class AlgoBotsUpdateDto {
  @ApiProperty()
  name?: string;

  @ApiProperty()
  botVer?: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  base?: string;

  @ApiProperty()
  quote?: string;

  @ApiProperty()
  stratType?: string;

  @ApiProperty()
  category?: string;

  @ApiProperty()
  ownerId?: string;

  @ApiProperty()
  avgtrades?: number;
}

export class AlgoBotRankingDto {
  @ApiProperty()
  botId: string;

  @ApiProperty()
  botName: string;

  @ApiProperty()
  followers: number;
}

export class AlgoBotRatingDto {
  @ApiProperty()
  ratings: number;

  @ApiProperty()
  raters: number;

  @ApiProperty()
  myRating: number;

  @ApiProperty()
  myComment: string;
}

export class UserBotCreateDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  accountId: string;

  @ApiProperty()
  base: string;

  @ApiProperty()
  quote: string;

  @ApiProperty()
  stratType: string; // LONG, SHORT, LONG_SHORT

  @ApiProperty()
  orderType: string; // LIMIT, MARKET

  @ApiProperty()
  position: number;

  @ApiProperty()
  leverage: number;

  @ApiProperty()
  webhook: {
    exitTrigger: boolean;
  };
}

export class UserBotWebhookDto {
  botId: string;

  stratType: string;

  position: string;

  userFilter?: string[];

  secret?: string;
}

export class UserBotWebhookMessageDto {
  @ApiProperty()
  webhookURL: string;

  @ApiProperty()
  messages: UserBotWebhookDto[];
}
