// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var algobot_pb = require('./algobot_pb.js');

function serialize_algobot_DeleteSubscriptionRequest(arg) {
  if (!(arg instanceof algobot_pb.DeleteSubscriptionRequest)) {
    throw new Error('Expected argument of type algobot.DeleteSubscriptionRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_algobot_DeleteSubscriptionRequest(buffer_arg) {
  return algobot_pb.DeleteSubscriptionRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_algobot_DeleteSubscriptionResponse(arg) {
  if (!(arg instanceof algobot_pb.DeleteSubscriptionResponse)) {
    throw new Error('Expected argument of type algobot.DeleteSubscriptionResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_algobot_DeleteSubscriptionResponse(buffer_arg) {
  return algobot_pb.DeleteSubscriptionResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_algobot_FollowBotRequest(arg) {
  if (!(arg instanceof algobot_pb.FollowBotRequest)) {
    throw new Error('Expected argument of type algobot.FollowBotRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_algobot_FollowBotRequest(buffer_arg) {
  return algobot_pb.FollowBotRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_algobot_FollowBotResponse(arg) {
  if (!(arg instanceof algobot_pb.FollowBotResponse)) {
    throw new Error('Expected argument of type algobot.FollowBotResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_algobot_FollowBotResponse(buffer_arg) {
  return algobot_pb.FollowBotResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_algobot_UserBotSubscriptionPauseRequest(arg) {
  if (!(arg instanceof algobot_pb.UserBotSubscriptionPauseRequest)) {
    throw new Error('Expected argument of type algobot.UserBotSubscriptionPauseRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_algobot_UserBotSubscriptionPauseRequest(buffer_arg) {
  return algobot_pb.UserBotSubscriptionPauseRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_algobot_UserBotSubscriptionPauseResponse(arg) {
  if (!(arg instanceof algobot_pb.UserBotSubscriptionPauseResponse)) {
    throw new Error('Expected argument of type algobot.UserBotSubscriptionPauseResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_algobot_UserBotSubscriptionPauseResponse(buffer_arg) {
  return algobot_pb.UserBotSubscriptionPauseResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var AlgobotServiceService = exports.AlgobotServiceService = {
  followAlgobot: {
    path: '/algobot.AlgobotService/FollowAlgobot',
    requestStream: false,
    responseStream: false,
    requestType: algobot_pb.FollowBotRequest,
    responseType: algobot_pb.FollowBotResponse,
    requestSerialize: serialize_algobot_FollowBotRequest,
    requestDeserialize: deserialize_algobot_FollowBotRequest,
    responseSerialize: serialize_algobot_FollowBotResponse,
    responseDeserialize: deserialize_algobot_FollowBotResponse,
  },
  pauseUnpause: {
    path: '/algobot.AlgobotService/PauseUnpause',
    requestStream: false,
    responseStream: false,
    requestType: algobot_pb.UserBotSubscriptionPauseRequest,
    responseType: algobot_pb.UserBotSubscriptionPauseResponse,
    requestSerialize: serialize_algobot_UserBotSubscriptionPauseRequest,
    requestDeserialize: deserialize_algobot_UserBotSubscriptionPauseRequest,
    responseSerialize: serialize_algobot_UserBotSubscriptionPauseResponse,
    responseDeserialize: deserialize_algobot_UserBotSubscriptionPauseResponse,
  },
  deleteSubscription: {
    path: '/algobot.AlgobotService/DeleteSubscription',
    requestStream: false,
    responseStream: false,
    requestType: algobot_pb.DeleteSubscriptionRequest,
    responseType: algobot_pb.DeleteSubscriptionResponse,
    requestSerialize: serialize_algobot_DeleteSubscriptionRequest,
    requestDeserialize: deserialize_algobot_DeleteSubscriptionRequest,
    responseSerialize: serialize_algobot_DeleteSubscriptionResponse,
    responseDeserialize: deserialize_algobot_DeleteSubscriptionResponse,
  },
};

exports.AlgobotServiceClient = grpc.makeGenericClientConstructor(AlgobotServiceService);
