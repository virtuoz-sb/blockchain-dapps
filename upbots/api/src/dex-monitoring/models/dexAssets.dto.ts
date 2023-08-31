import { ApiProperty } from "@nestjs/swagger";
import { AssetsEvolution } from "./dex-assets.schema";

export default class DexAssetsDto {
  @ApiProperty()
  address: string;

  @ApiProperty()
  evolution: AssetsEvolution[];
}
