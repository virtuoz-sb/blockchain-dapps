import { ApiProperty } from "@nestjs/swagger";

/**
 * frontend page access
 * (previsously SettingsPages)
 */
export default interface PageSettings {
  name: string;

  path: string;

  comingSoon: boolean;
}

export class PageSettingsDto implements PageSettings {
  @ApiProperty()
  name: string;

  @ApiProperty()
  path: string;

  @ApiProperty()
  comingSoon: boolean;
}
