import { IsMongoId, IsBoolean, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class NodeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsMongoId()
  blockchain: string;

  @IsNotEmpty()
  @IsString()
  wsProviderURL: string;

  @IsNotEmpty()
  @IsString()
  rpcProviderURL: string;  

  @IsOptional()
  @IsString()
  ipAddress: string;  

  @IsOptional()
  @IsString()
  checkUrl: string;  

  @IsNotEmpty()
  @IsBoolean()
  active: boolean;
}
