import { Controller, Logger } from "@nestjs/common";
import { Ctx, RmqContext, MessagePattern, Transport } from "@nestjs/microservices";
import { WebsocketGateway } from "./websocket.gateway";
import OrderEventPayload from "./models/order-event.payload";
import NotificationRepository from "./repositories/notification.repository";
import PerformanceService from "../performance/services/performance.service";
/**
 * AMQP message controller. Receives (consumes) AMQP event messages from trade engine.
 */
@Controller()
export default class OrderEventController {
  private readonly logger = new Logger(OrderEventController.name);

  constructor(
    private readonly wsGateway: WebsocketGateway,
    private repo: NotificationRepository,
    private performanceService: PerformanceService
  ) {}

  @MessagePattern(undefined, Transport.RMQ)
  async orderEventNotify(@Ctx() context: RmqContext) {
    // this.logger.debug(`orderEventNotify`);
    const raw = context.getMessage();
    const orderEventPayload = JSON.parse((raw.content as any).toString()) as OrderEventPayload;
    this.logger.debug(`***-orderEventNotify parsed payload ${JSON.stringify(orderEventPayload)}`);
    const orderTracking = await this.performanceService.getOrderTrackingById(orderEventPayload.orderTrack);
    if (!orderTracking || orderTracking.aborted) {
      this.logger.debug(`***-orderEventNotify-return: null or aborted order# ${orderEventPayload.orderTrack}`);
      return;
    }

    if (orderEventPayload && orderEventPayload.userId && orderEventPayload.userId.length > 0) {
      if (orderEventPayload.status === "NEW" && orderEventPayload.source === "ow") {
        this.logger.debug(`avoid duplicated NEW notification for user ${orderEventPayload.userId} ${orderEventPayload.orderTrack}`);
        return;
      }
      // if (orderEventPayload.exch !== "kucoin" && orderEventPayload.status === "CANCELED" && orderEventPayload.source === "o") {
      //   this.logger.debug(`avoid duplicated NEW notification for user ${orderEventPayload.userId} ${orderEventPayload.orderTrack}`);
      //   return;
      // }
      if (orderEventPayload.status === "FILLED" && orderEventPayload.type === "MARKET" && orderEventPayload.source === "ow") {
        // note: market order status only comes from orderer source (not order watcher)
        this.logger.debug(`avoid duplicated FILLED notification for user ${orderEventPayload.userId} ${orderEventPayload.orderTrack}`);
        return;
      }

      try {
        if (orderEventPayload.initiator === "algobot") {
          await this.performanceService.updateSubscriptionCyclesByOrderTracking(orderEventPayload.orderTrack);
        }
      } catch (err) {
        this.logger.error(`subscription update error notifyUser error:`);
        this.logger.error(err);
      }

      try {
        this.wsGateway.notifyUser(orderEventPayload);
      } catch (err) {
        this.logger.error(`websocket notifyUser error:`);
        this.logger.error(err);
      }

      try {
        await this.repo.saveOrderNotification(orderEventPayload);
      } catch (err) {
        this.logger.error(`saveOrderNotification error:`);
        this.logger.error(err);
      }
    } else {
      this.logger.warn(`parsed OrderEventPayload with empty user; ws notification won't work ${JSON.stringify(orderEventPayload)}`);
    }
  }
}
