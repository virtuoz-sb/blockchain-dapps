import {
  Request,
  Body,
  Controller,
  DefaultValuePipe,
  ForbiddenException,
  Get,
  HttpStatus,
  Logger,
  ParseIntPipe,
  Post,
  Put,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import ApiErrorResponse from "../shared/api-error-reponse";
import validationPipe from "../shared/validation.pipe";
import { UserIdentity } from "../types";
import UserFromJWT from "../utilities/user.decorator";
import { CreateDirectOrderDto, OrderCreatedResponseDto } from "./model/create-simple-order.dto";
import { ManualTradeApiTag, ManualTradeRoutePrefix } from "./route_constant";
import DirectOrderService from "./services/direct-order.sevice";
import FakeModeInterceptor from "./fake-mode.interceptor";
import DirectOrderDataService from "./services/direct-order-data.sevice";
import { OrderTrackingDto } from "./model/order-tracking.dto";
import IpAddress from "../utilities/ip-address.decorator";
import { createUserIpAddressInfo } from "../auth/auth.helper";

@ApiTags(ManualTradeApiTag)
@UseGuards(AuthGuard("jwt"))
@Controller(ManualTradeRoutePrefix)
export default class DirectOrderTradeController {
  private readonly logger = new Logger(DirectOrderTradeController.name);

  constructor(private orderSvc: DirectOrderService, private dataSvc: DirectOrderDataService) {}

  @Post("directorder")
  @UseInterceptors(FakeModeInterceptor)
  @ApiOperation({
    summary: "create manual trade direct-order",
    description: `Add a new order request to the trading engine`,
  })
  @ApiResponse({
    status: 201,
    type: OrderCreatedResponseDto,
  })
  @ApiResponse({
    status: 422,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 403,
    description: "when user permission was denied (role based access)",
  })
  async createNewDirectOrder(
    @Request() req,
    @UserFromJWT() userInfo: UserIdentity,
    @Body(validationPipe)
    data: CreateDirectOrderDto,
    @IpAddress() ipAddress
  ): Promise<OrderCreatedResponseDto> {
    this.logger.debug(`createNewDirectOrder dto:${JSON.stringify(data)}`);
    const userAccess = createUserIpAddressInfo(req, ipAddress);
    return this.orderSvc.directOrder(userInfo?.id, data, userAccess);
  }

  @Put("directorder/cancel/:orderTrackingId")
  @ApiOperation({
    summary: "cancel manual trade direct-order",
    description: `Request cancel of order to the trading engine`,
  })
  @ApiParam({
    name: "orderTrackingId",
    type: String,
    required: true,
  })
  async directOrderCancel(@Param("orderTrackingId") orderTrackingId: string): Promise<boolean> {
    this.logger.debug(`directOrderCancel orderTrackId:${orderTrackingId}`);
    return this.orderSvc.directOrderCancel(orderTrackingId);
    return null;
  }

  @Get("directorders")
  @ApiOperation({
    summary: "(deprecated will soon be removed) return direct-order list",
  })
  @ApiResponse({
    status: 201,
    type: OrderTrackingDto,
    isArray: true,
  })
  @ApiResponse({
    status: 422,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 403,
    description: "when user permission was denied (role based access)",
  })
  async getDirectOrders(
    @UserFromJWT() user: UserIdentity,
    @Query("p", new DefaultValuePipe(0), new ParseIntPipe({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })) page: number, // ParseIntPipe: cast query param to number
    @Query("s", new DefaultValuePipe(10), new ParseIntPipe({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })) pageSize: number // DefaultValuePipe makes query string optional
  ): Promise<OrderTrackingDto[]> {
    this.logger.debug(`getDirectOrders `);
    if (!user) {
      throw new ForbiddenException();
    }
    return this.dataSvc.getDirectOrders(user.id, page, pageSize);
  }

  @Get("orders")
  @ApiOperation({
    summary: "return orders list",
    description:
      "Request Params: p = page number (default: 0), s = page size (default: 10), initiatorFilters = filters on initiator fieldName, sort = fieldname to consider for sorting, sortDir = <asc,desc>.",
  })
  @ApiResponse({
    status: 201,
    type: OrderTrackingDto,
    isArray: true,
  })
  @ApiResponse({
    status: 422,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 403,
    description: "when user permission was denied (role based access)",
  })
  async getOrders(
    @UserFromJWT() user: UserIdentity,
    @Query("p", new DefaultValuePipe(0), new ParseIntPipe({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })) page: number, // ParseIntPipe: cast query param to number
    @Query("s", new DefaultValuePipe(10), new ParseIntPipe({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })) pageSize: number, // DefaultValuePipe makes query string optional
    @Query("initiatorFilters") initiatorFilters: string,
    @Query("sort") sort: string,
    @Query("sortDir") sortDir: string
  ): Promise<OrderTrackingDto[]> {
    this.logger.debug(`getOrders `);
    if (!user) {
      throw new ForbiddenException();
    }
    return this.dataSvc.getOrders(user.id, page, pageSize, !initiatorFilters ? [] : initiatorFilters.split(","), sort, sortDir);
  }
}
