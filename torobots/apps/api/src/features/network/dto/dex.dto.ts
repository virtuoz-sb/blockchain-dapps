import { IsMongoId, IsNotEmpty, IsString, IsEthereumAddress } from 'class-validator';
import { EDexType } from '@torobot/shared';
export class DexDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsMongoId()
  blockchain: string;

  @IsNotEmpty()
  @IsString()
  type: EDexType;

  @IsNotEmpty()
  @IsEthereumAddress()
  factoryAddress: string;

  @IsNotEmpty()
  @IsEthereumAddress()
  routerAddress: string;  
}
