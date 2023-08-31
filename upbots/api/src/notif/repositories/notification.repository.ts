/* eslint-disable no-param-reassign */
import { Injectable, Logger } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import OrderEventPayload from "../models/order-event.payload";
import { mapEventToNotif, mapToDto } from "./orderEvent_mapper";
import NotificationModel, { NotificationDto } from "../models/notification.model";
import byCreatedAtDesc from "./sortingWithNull";
import { OrderTrackingModel, OrderTrackingModelName } from "../../trade/model/order-tracking.schema";
import { AlgoBotModel } from "../../algobot/models/algobot.model";

export const NOTIFICATION_MODEL_NAME = "NOTIFICATION_MODEL_NAME";

@Injectable()
export default class NotificationRepository {
  private readonly logger = new Logger(NotificationRepository.name);

  constructor(
    @InjectModel(NOTIFICATION_MODEL_NAME) private NotifModel: Model<NotificationModel>,
    @InjectModel(OrderTrackingModelName) private orderTrackModel: Model<OrderTrackingModel>,
    @InjectModel("AlgobotsModel") private botModel: Model<AlgoBotModel>
  ) {}

  async saveOrderNotification(orderEvent: OrderEventPayload): Promise<Notification> {
    this.logger.debug(`saveOrderNotification for: ${orderEvent.orderTrack} ${orderEvent.userId}`);
    // Add Bot Name to order notifications
    orderEvent.botName = "";
    const orderTrackDetails = await this.orderTrackModel.findOne({ _id: orderEvent.orderTrack }).select("botId aborted");
    if (orderTrackDetails && orderTrackDetails.aborted) {
      return null;
    }

    try {
      const bot = await this.botModel.findOne({ _id: orderTrackDetails.botId }).select("name");
      orderEvent.botName = bot ? bot.name : "";
    } catch (ex) {
      this.logger.error(`saveOrderNotification error: ${ex}`);
    }

    const toSave = mapEventToNotif(orderEvent);
    const newNotification = new this.NotifModel(toSave); // memory style
    await newNotification.save();
    return newNotification.toJSON({ versionKey: false }); // serialization case -> version
  }

  async findUnreadUserNotifications(id: string, page, perPage: number): Promise<NotificationDto[]> {
    const r = await this.NotifModel.find({ userId: id, isRead: false, isDeleted: false }, null, {
      sort: {
        createdAt: -1, // more recent first
      },
    })
      .limit(perPage)
      .skip(page * perPage);
    return r.map((x) => mapToDto(x.toJSON())).sort(byCreatedAtDesc);
  }

  async findReadUserNotifications(id: string, page, perPage: number): Promise<NotificationDto[]> {
    const r = await this.NotifModel.find({ userId: id, isRead: true, isDeleted: false }, null, {
      sort: {
        createdAt: -1, // more recent first
      },
    })
      .limit(perPage)
      .skip(page * perPage);
    return r.map((x) => mapToDto(x.toJSON())).sort(byCreatedAtDesc);
  }

  async findAllUserNotifications(id: string, page, perPage: number): Promise<NotificationDto[]> {
    const r = await this.NotifModel.find({ userId: id, isDeleted: false }, null, {
      sort: {
        createdAt: -1, // more recent first
        // legacy notification have a logtime string that is now mapped to createdAt in the new version (see schema.toJson())
      },
    })
      .limit(perPage)
      .skip(page * perPage);
    return r.map((x) => mapToDto(x.toJSON())).sort(byCreatedAtDesc);
  }

  async readUserNotification(id: string, notificationId: string): Promise<boolean> {
    const q = await this.NotifModel.updateOne({ _id: notificationId, userId: id }, { isRead: true });
    const { nModified }: { nModified: number } = q;

    return nModified === 1;
  }

  async deleteUserNotification(id: string, notificationId: string): Promise<boolean> {
    const q = await this.NotifModel.updateOne({ _id: notificationId, userId: id }, { isDeleted: true, deletedAt: new Date() });
    const { nModified }: { nModified: number } = q;

    return nModified === 1;
  }

  async readAllUserNotification(id: string): Promise<boolean> {
    const q = await this.NotifModel.updateMany({ userId: id }, { isRead: true });
    const { nModified }: { nModified: number } = q;

    return nModified > 0;
  }

  async unreadAllUserNotification(id: string): Promise<boolean> {
    const q = await this.NotifModel.updateMany({ userId: id }, { isRead: false });
    const { nModified }: { nModified: number } = q;

    return nModified > 0;
  }
}
