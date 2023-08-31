/* eslint-disable max-classes-per-file */
/* eslint-disable import/prefer-default-export */
import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty } from "class-validator";
import { InvalidMongoId } from "../../shared/error-message";

export class AlgobotSubscriptionStateRequest {
  @ApiProperty()
  botId?: string;

  @ApiProperty()
  @IsMongoId({ message: InvalidMongoId })
  @IsNotEmpty()
  subId: string;

  // TODO: add option to close position when paused or remain on position
  // options?:string
}

export class AlgobotSubscriptionStateResponseDto {
  @ApiProperty()
  @IsMongoId({ message: InvalidMongoId })
  subId: string;

  @ApiProperty()
  enabled: boolean;
}

export class BotSubscriptionDeletedDto {
  @ApiProperty()
  ack: string;
}
