import { NotificationDto } from "../models/notification.model";

const byCreatedAtDesc = (a: NotificationDto, b: NotificationDto) => {
  const noDate = new Date(0);
  return (b.createdAt ?? noDate).getTime() - (a.createdAt ?? noDate).getTime();
};

export default byCreatedAtDesc;
