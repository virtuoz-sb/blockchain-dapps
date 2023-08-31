import NotificationModel, { NotificationDto } from "../models/notification.model";
import OrderEventPayload from "../models/order-event.payload";

export const mapEventToNotif = function mapEventToNotif(event: OrderEventPayload): NotificationModel {
  if (!event) {
    return null;
  }
  const { error, exDelay, source, ...mapped } = event; // remove props in OrderEventPayload that are not in OrderEventData
  return mapped as NotificationModel;
};

export const mapToDto = function mapToDto(model: NotificationModel): NotificationDto {
  if (!model) {
    return null;
  }
  const { isDeleted, ...mapped } = model;
  return mapped as NotificationDto;
};
