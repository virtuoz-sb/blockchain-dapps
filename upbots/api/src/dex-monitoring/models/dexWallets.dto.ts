import { ApiProperty } from "@nestjs/swagger";

export default class DexWalletDto {
  @ApiProperty()
  label: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  allWallets?: boolean;
}
