import { ApiProperty } from "@nestjs/swagger";

/**
 */
export default interface VarSettings {
  name: string;

  value: string;
}

export class VarSettingsDto implements VarSettings {
  @ApiProperty()
  name: string;

  @ApiProperty()
  value: string;
}
