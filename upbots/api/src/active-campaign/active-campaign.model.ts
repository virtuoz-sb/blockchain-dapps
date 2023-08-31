import { Document } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsMongoId } from "class-validator";

export default class ActiveCampaignUserDB extends Document {
  @IsString()
  @IsMongoId()
  _id: string;

  @IsString()
  userId: string;

  @ApiProperty()
  tags: string;
}
