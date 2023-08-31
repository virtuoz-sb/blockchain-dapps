/* eslint-disable no-param-reassign */
import { Optional } from "@nestjs/common";
import { Transform } from "class-transformer";

export default class OptionalNumberDto {
  @Optional()
  @Transform((take) => {
    take = Number(take); // by design we transform the input reference (hence es-lint ignore rule)
    if (Number.isNaN(take)) {
      take = undefined;
      return undefined;
    }
    return take;
  })
  take?: number;
}
