import { IsMongoId, IsString, IsOptional } from 'class-validator';

export class MsglogDto 
{
  @IsOptional()
  @IsString()
  msgType: string;

  @IsOptional()
  @IsString()
  msgFrom: string;

  @IsOptional()
  @IsString()
  msgTo: string;

  @IsOptional()
  @IsString()
  msgContent: string;
}
