import { Controller, Get, Logger, OnModuleInit } from "@nestjs/common";
import { Client, ClientKafka, MessagePattern, Transport, Payload } from "@nestjs/microservices";
import { microserviceConfig } from "./microservice.config";
import { DEPOSIT_TRANSACTION, DEPOSIT_TRANSACTION_CONFIRM, DEPOSIT_TRANSACTION_REMOVE } from "./constant";

import DepositService from "../../services/deposit.service";

@Controller()
export default class DepositKafkaConsumerController implements OnModuleInit {
  private readonly logger = new Logger(DepositKafkaConsumerController.name);

  constructor(private readonly depositService: DepositService) {}

  @Client(microserviceConfig)
  client: ClientKafka;

  async onModuleInit() {
    if (process.env.DISABLE_KAFKA_TRANSPORT === "true") {
      return;
    }

    if (process.env.ENABLE_PERF_FEES_FEATURE !== "1") {
      return;
    }

    const requestPatterns = [DEPOSIT_TRANSACTION, DEPOSIT_TRANSACTION_CONFIRM];

    requestPatterns.forEach((pattern) => {
      this.client.subscribeToResponseOf(pattern);
    });

    Logger.debug("Kafka transport controller is running");
    await this.client.connect();
  }

  @MessagePattern(DEPOSIT_TRANSACTION, Transport.KAFKA)
  async deposit(@Payload() payload): Promise<any> {
    if (!payload || !payload.value) {
      this.logger.error("DEPOSIT_TRANSACTION message invalid", "ConsumerController");
      return;
    }

    try {
      await this.depositService.deposit(payload.value);
    } catch (e) {
      this.logger.error(e, "ConsumerController");
    }
  }

  @MessagePattern(DEPOSIT_TRANSACTION_CONFIRM, Transport.KAFKA)
  async depositConfirm(@Payload() payload): Promise<any> {
    if (!payload || !payload.value) {
      this.logger.error("DEPOSIT_TRANSACTION_CONFIRM message invalid", "ConsumerController");
      return;
    }

    try {
      await this.depositService.depositConfirm(payload.value);
    } catch (e) {
      this.logger.error(e, "ConsumerController");
    }
  }

  @MessagePattern(DEPOSIT_TRANSACTION_REMOVE, Transport.KAFKA)
  async depositRemove(@Payload() payload): Promise<any> {
    if (!payload || !payload.value) {
      this.logger.error("DEPOSIT_TRANSACTION_REMOVE message invalid", "ConsumerController");
      return;
    }

    try {
      await this.depositService.depositRemove(payload.value);
    } catch (e) {
      this.logger.error(e, "ConsumerController");
    }
  }
}
