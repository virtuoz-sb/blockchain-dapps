import { Injectable } from "@nestjs/common";

import { WebsocketGateway } from "../../notif/websocket.gateway";

@Injectable()
export default class NotificationService {
  constructor(private wsGateway: WebsocketGateway) {}

  async notifyForPerformanceCyclesUpdated(userId: string) {
    await this.wsGateway.notifyPerformanceCyclesEventToUser(userId);
  }

  async notifyForUserTransactionUpdated(userId: string) {
    await this.wsGateway.notifyPerfeesEventToUser(userId, "USER-TRANSACTION-UPDATED", {});
  }

  async notifyForWalletUpdated(userId: string) {
    await this.wsGateway.notifyPerfeesEventToUser(userId, "WALLET-UPDATED", {});
  }

  async notifyForWalletNoAmount(userId: string) {
    await this.wsGateway.notifyPerfeesEventToUser(userId, "WALLET-NO-ENOUGH", {});
  }
}
