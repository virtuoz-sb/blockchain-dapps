/* eslint-disable no-underscore-dangle */
import { Types } from "mongoose";
import { OrderTrackingDto } from "../../../trade/model/order-tracking.dto";
import { OrderTrackingModel } from "../../../trade/model/order-tracking.schema";
import AlgobotsSubscriptionAuditDto from "../../models/algobot-subscription-audit.dto";
import { AlgoBotSubscriptionAuditModel } from "../../models/algobot-subscription-audit.model";

const mapToBotSubscriptionAuditDto = function mapToBotSubscriptionAuditDto(m: AlgoBotSubscriptionAuditModel): AlgobotsSubscriptionAuditDto {
  if (!m) return null;
  const {
    error,
    errorReason,
    errorAt,
    botId,
    botSubId,
    oTrackId, // full entity
    userId,
    accountPercent,
    positionType,
    positionAmount,
    status,
    position,
    followed,
    cycleSequence,
    createdAt,
    updatedAt,
    signalId,
    currency,
    exchange,
    balance,
  } = m;

  const odoc = (oTrackId as unknown) as OrderTrackingModel; // joined by mongoose populate query
  const mappedOrderTrack = odoc ? (odoc.toJSON() as OrderTrackingDto) : null;
  return {
    id: (m._id as Types.ObjectId).toHexString(),
    botId: botId.toHexString(),
    botSubId: botSubId.toHexString(),
    // oTrackId: oTrackId.toHexString(),
    oTrackId: mappedOrderTrack,
    userId: userId.toHexString(),
    error,
    errorReason,
    errorAt,
    accountPercent,
    positionType,
    positionAmount,
    status,
    position,
    followed,
    cycleSequence,
    createdAt,
    updatedAt,
    signalId,
    currency,
    exchange,
    balance,
  };
};

export default mapToBotSubscriptionAuditDto;
