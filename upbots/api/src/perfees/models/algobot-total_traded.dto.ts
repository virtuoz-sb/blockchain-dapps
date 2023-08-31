import { ApiProperty } from "@nestjs/swagger";

export default class AlgobotsTotalTradedPerBotDto {
  @ApiProperty()
  botId: string;

  @ApiProperty()
  botName: string;

  @ApiProperty()
  allocatedAmount: number;

  @ApiProperty()
  quote: [string];

  @ApiProperty()
  base: [string];

  @ApiProperty()
  bot: [string];

  @ApiProperty()
  botVer: [string];

  @ApiProperty()
  botCreator: [string];
}
