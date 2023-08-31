import { Document } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsMongoId } from "class-validator";
import { ContactPropertyType } from "./marketing-automation.types";

export default class MarketingAutomation extends Document {
  @IsString()
  @IsMongoId()
  _id: string;

  @IsString()
  userId: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty()
  exchangeAdded: ContactPropertyType;

  @ApiProperty()
  firstDepositAdded: ContactPropertyType;

  @ApiProperty()
  hasActivatedBot: ContactPropertyType;

  @ApiProperty()
  hasDisabledBotNoBotYet: ContactPropertyType;
}
