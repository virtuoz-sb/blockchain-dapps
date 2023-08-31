/* eslint-disable no-plusplus */
import { Injectable, Logger } from "@nestjs/common";
import * as sio from "socket.io";
import { UserIdentity } from "../../types";

@Injectable()
export default class SocketSessionService {
  private readonly logger = new Logger(SocketSessionService.name);

  private connectedSockets: { [userId: string]: sio.Socket[] } = {};

  private socketIdUserId = new Map<string, string>();

  add(user: UserIdentity, client: sio.Socket) {
    if (!this.connectedSockets[user.id]) this.connectedSockets[user.id] = [];
    this.connectedSockets[user.id].push(client);

    if (!this.socketIdUserId.has(client.id)) {
      this.socketIdUserId.set(client.id, user.id);
    }
    this.getSessionStats();
  }

  remove(client: sio.Socket) {
    const socketId = client.id;
    if (this.socketIdUserId.has(socketId)) {
      const userID = this.socketIdUserId.get(socketId);
      this.socketIdUserId.delete(socketId);

      this.connectedSockets[userID] = this.connectedSockets[userID].filter((p) => p.id !== socketId);
      this.getSessionStats();
    }
  }

  getSessionStats() {
    let userCount = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const userId of Object.keys(this.connectedSockets)) {
      if (this.connectedSockets[userId].length > 0) {
        userCount++;
      }
    }
    const socketsCount = this.socketIdUserId.size;
    this.logger.debug(`Total sockets ${socketsCount}, total users ${userCount}`);
  }

  findUserSockets(userId: string): sio.Socket[] {
    if (!userId) return [];
    return this.connectedSockets[userId];
  }
}
