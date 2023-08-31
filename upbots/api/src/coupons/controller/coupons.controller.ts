import { Body, Controller, Get, Logger, Param, Post, Query, UnprocessableEntityException, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Dictionary } from "ccxt";
import validationPipe from "../../shared/validation.pipe";
import { UserIdentity } from "../../types";
import UserFromJWT from "../../utilities/user.decorator";
import { CouponsCreationDto, GetCoupons } from "../models/coupons.types";
import CouponsService from "../services/coupons.service";

@ApiTags("coupons")
@Controller("coupons")
class CouponsController {
  constructor(private couponsService: CouponsService) {}

  @Get()
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "Get all coupons.",
    description: `Can filter on promomotion name`,
  })
  @ApiQuery({
    type: String,
    name: "promoName",
    required: false,
  })
  async getAllCoupons(@Query("promoName") promoName: string): Promise<GetCoupons[]> {
    const filters: Dictionary<string> = {};
    if (promoName) {
      filters.promoName = promoName;
    }
    const coupons = await this.couponsService.getCouponsFiltered({ ...filters });
    return coupons;
  }

  @Get("/user")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "For the logged user, return the list of coupons.",
    description: `Can filter on promomotion name`,
  })
  @ApiQuery({
    type: String,
    name: "promoName",
    required: false,
  })
  async getUserCoupons(@UserFromJWT() user: UserIdentity, @Query("promoName") promoName: string): Promise<GetCoupons[]> {
    const { id } = user;
    const filters: Dictionary<string> = { userId: id };
    if (promoName) {
      filters.promoName = promoName;
    }
    const coupons = await this.couponsService.getCouponsFiltered({ ...filters });
    return coupons;
  }

  @Post()
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "Create coupons",
    description: `Create new coupons`,
  })
  async createCoupons(
    @Body(validationPipe)
    data: CouponsCreationDto
  ): Promise<GetCoupons[]> {
    const { validFrom, validTo } = data;
    if (validFrom || validTo) {
      if (typeof validFrom !== "number" || typeof validTo !== "number") {
        throw new Error("If any validity date, [validFrom] and [validTo] are both mandatory and must be unix timestamp.");
      }

      const nowTimestamp: number = new Date().getTime();
      if (validTo < nowTimestamp) {
        throw new UnprocessableEntityException("create coupon validation error", "[validTo] must be bigger or equal to today's date.");
      }
      if (validTo < validFrom) {
        throw new UnprocessableEntityException("create coupon validation error", "[validTo] must be bigger than [validFrom].");
      }
    }

    const coupons = await this.couponsService.createCoupons(data);

    return coupons;
  }

  @Post("activate/unique/:code")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "Activate a unique coupon",
    description: `Activate a unique coupon and link it to the user account`,
  })
  @ApiParam({
    name: "code",
    type: String,
    required: true,
  })
  async activateUniqueCoupon(@UserFromJWT() userInfo: UserIdentity, @Param("code") code: string): Promise<GetCoupons> {
    const coupon = await this.couponsService.activateUniqueCoupon(code, userInfo.id);
    return coupon;
  }
}

export default CouponsController;
