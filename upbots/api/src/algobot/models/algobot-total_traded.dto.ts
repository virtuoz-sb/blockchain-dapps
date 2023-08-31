import { ApiProperty } from "@nestjs/swagger";

export default class AlgobotsTotalTradedPerBotDto {
  @ApiProperty()
  _id: {
    botId: string;
    side: string;
  };

  @ApiProperty()
  orderCount: number;

  @ApiProperty()
  amountBase: number;

  @ApiProperty()
  amountQuote: number;

  @ApiProperty()
  botDetail: {
    botRef: string;
    createdAt: string;
    creator: string;
    description: string;
    img: string;
    market: {
      base: string;
      quote: string;
    };
    name: string;
  };
}
