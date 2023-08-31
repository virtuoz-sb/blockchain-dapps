import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import SupportGuard from "../../shared/support.guard";
import { GetCurrencyOwnersDto } from "../models/currency-owners.dto";
import SupportService from "../services/support.service";
import UbxtStakingService from "../services/ubxt-stacking.service";

@ApiTags("support")
@Controller("support")
@UseGuards(AuthGuard("jwt"), SupportGuard)
export default class SupportController {
  constructor(private service: SupportService, private stakingSvc: UbxtStakingService) {}

  @Get("/:currency/owners")
  @ApiParam({
    name: "currency",
    type: String,
    required: true,
    example: "UBXT",
  })
  @ApiResponse({
    status: 200,
    type: GetCurrencyOwnersDto,
    description: `
            For a given currency, returns the list of users owning it in Upbots.
        `,
  })
  async getCurrencyOwners(@Param("currency") currency): Promise<GetCurrencyOwnersDto> {
    return this.service.getCurrencyOwners(currency.toUpperCase());
  }

  @ApiResponse({
    status: 200,
    type: GetCurrencyOwnersDto,
    description: `returns the list of ubxt_locked owner on FTX (staking program)`,
  })
  @Get("/staking/ubxt_locked")
  getUbxtStackinUsers(): Promise<GetCurrencyOwnersDto> {
    return this.stakingSvc.getUbxtStackingUsers();
  }
}
