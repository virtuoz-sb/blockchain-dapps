/* eslint-disable no-underscore-dangle */
import { Types } from "mongoose";
import AlgobotsSubscriptionDto from "../../models/algobot-subscription.dto";
import { AlgoBotSubscriptionModel } from "../../models/algobot-subscription.model";

const mapToBotSubscriptionDto = function mapToBotSubscriptionDto(m: AlgoBotSubscriptionModel): AlgobotsSubscriptionDto {
  if (!m) return null;
  const {
    botId,
    apiKeyRef,
    botRunning,
    enabled,
    isOwner,
    feesToken,
    feesPlan,
    accountType,
    stratType,
    createdAt,
    updatedAt,
    cycleSequence,
    status,
    accountPercent,
    positionType,
    positionAmount,
    accountLeverage,
    contractSize,
    baseAmount,
    openedQuantity,
    quote,
    accountAllocated,
    error,
    errorAt,
    errorReason,
  } = m;
  return {
    id: (m._id as Types.ObjectId).toHexString(),
    botId: (botId as Types.ObjectId).toHexString(),
    apiKeyRef,
    botRunning,
    enabled,
    isOwner,
    feesToken,
    feesPlan,
    accountType,
    stratType,
    createdAt,
    updatedAt,
    cycleSequence,
    status,
    accountPercent,
    positionType,
    positionAmount,
    accountLeverage,
    contractSize,
    baseAmount,
    openedQuantity,
    quote,
    accountAllocated,
    error,
    errorAt,
    errorReason,
  };
};

export default mapToBotSubscriptionDto;
