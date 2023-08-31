import { Inject, Injectable, Logger, UnprocessableEntityException } from "@nestjs/common";
import {
  DirectOrderRequest,
  DirectOrderCancelRequest,
  OrderType as OrderTypeProto,
  SideType,
} from "../../proto/directorder/directorder_pb";
import { DirectOrderServiceClient } from "../../proto/directorder/directorder_grpc_pb";
import { CreateDirectOrderDto, OrderCreatedResponseDto } from "../model/create-simple-order.dto";
import { OrderSideType, OrderType } from "../model/create-strategy-dto";
import { GRPC_DIRECT_ORDER_CLIENT } from "../grpc-client/grpc-directorder-client-factory";
import DirectOrderDataService from "./direct-order-data.sevice";

@Injectable()
export default class DirectOrderService {
  private readonly logger = new Logger(DirectOrderService.name);

  constructor(
    @Inject(GRPC_DIRECT_ORDER_CLIENT)
    private readonly client: DirectOrderServiceClient,
    private readonly dataService: DirectOrderDataService
  ) {}

  directOrder(userId: string, data: CreateDirectOrderDto, userAccess?: any): Promise<OrderCreatedResponseDto> {
    const msg = this.createRequestMessage(userId, data);
    this.logger.log(`directOrder --> ${msg}`);

    const p = new Promise<OrderCreatedResponseDto>((resolve, reject) => {
      this.client.placeDirectOrder(msg, async (err, response) => {
        if (err) {
          this.logger.error(`placeDirectOrder ERROR for userID: ${userId.toString()}-${JSON.stringify(userAccess)} : ${err}`);
          // return typed ServiceError with more usefull user and endpoint context so that api logs can be more understandable
          return reject(err);
        }
        this.logger.debug(`placeDirectOrder grpc response for userID: ${userId.toString()}-${JSON.stringify(userAccess)} : ${response}`);
        if (response) {
          // TODO: convert to a more suitable object response (not the grpc response)
          const respData = response.toObject();
          this.dataService.updateDirectOrder(userId, respData.orderid, { userAccess });
          return resolve({ orderTrackId: respData.orderid } as OrderCreatedResponseDto);
        }
        return reject(new Error("empty grpc response"));
      });
    });

    return p;
  }

  directOrderCancel(orderTrackingId: string): Promise<boolean> {
    const msg = this.createCancelRequestMessage(orderTrackingId);
    this.logger.log(`directOrderCancel --> ${msg}`);

    const p = new Promise<boolean>((resolve, reject) => {
      this.client.cancelDirectOrder(msg, (err, response) => {
        if (err) {
          this.logger.error(`cancelDirectOrder ERROR for orderTrackingId: ${orderTrackingId} : ${err}`);
          // return typed ServiceError with more usefull user and endpoint context so that api logs can be more understandable
          return reject(err);
        }
        this.logger.debug(`cancelDirectOrder grpc response for userID: ${orderTrackingId} : ${response}`);
        if (response) {
          // TODO: convert to a more suitable object response (not the grpc response)
          const respData = response.toObject();
          return resolve(respData.okstatus);
        }
        return reject(new Error("empty grpc response"));
      });
    });

    return p;
  }

  private createCancelRequestMessage(orderTrackingId: string): DirectOrderCancelRequest {
    const x = new DirectOrderCancelRequest();
    x.setOrdertrackingid(orderTrackingId);
    return x;
  }

  private createRequestMessage(userId: string, data: CreateDirectOrderDto): DirectOrderRequest {
    this.validate(userId, data);
    const x = new DirectOrderRequest();
    x.setApikeyid(data.apiKeyRef);
    x.setExchange(data.exchange);
    x.setPrice(data.price);
    x.setQuantity(data.quantity);

    switch (data.side) {
      case OrderSideType.BUY:
        x.setSide(SideType.BUY);
        break;
      case OrderSideType.SELL:
        x.setSide(SideType.SELL);
        break;
      default:
        throw new UnprocessableEntityException("Invalid orderSide in request data"); // HTTP 422
    }

    x.setSymbol(data.symbol);
    switch (data.type) {
      case OrderType.MARKET:
        x.setType(OrderTypeProto.MARKET);
        break;
      case OrderType.LIMIT:
        x.setType(OrderTypeProto.LIMIT);
        break;
      default:
        throw new UnprocessableEntityException("Invalid OrderType in request data"); // HTTP 422
    }
    x.setUserid(userId);
    return x;
  }

  private validate(userId: string, x: CreateDirectOrderDto) {
    if (!x) {
      throw new UnprocessableEntityException("cannot simple order, request is null.");
    }
    if (!x.symbol) {
      throw new UnprocessableEntityException(`symbol required.`);
    }
    if (!x.exchange) {
      throw new UnprocessableEntityException(`exchange required.`);
    }
    if (!userId) {
      throw new UnprocessableEntityException(`userId required.`);
    }
  }
}
