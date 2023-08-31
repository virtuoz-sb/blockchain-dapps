import { Document } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsMongoId } from "class-validator";

export default class UserSettings extends Document {
  @IsString()
  @IsMongoId()
  _id: string;

  @IsString()
  userId: string;

  @ApiProperty()
  favoriteCurrency: {
    value: string;
    label: string;
  };

  @ApiProperty()
  darkMode: boolean;

  @ApiProperty()
  algobotFilters: {
    status: { label: string; value: string };
    strategy: { label: string; value: string };
    exchanges: string[];
    pairs: string[];
    sortedByValue: { label: string; value: string };
  };
}
