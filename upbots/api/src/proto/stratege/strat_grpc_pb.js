// GENERATED CODE -- DO NOT EDIT!

// Original file comments:
// Trading Strategy definition.
'use strict';
var grpc = require('grpc');
var strat_pb = require('./strat_pb.js');
var google_protobuf_timestamp_pb = require('google-protobuf/google/protobuf/timestamp_pb.js');
var google_protobuf_empty_pb = require('google-protobuf/google/protobuf/empty_pb.js');

function serialize_google_protobuf_Empty(arg) {
  if (!(arg instanceof google_protobuf_empty_pb.Empty)) {
    throw new Error('Expected argument of type google.protobuf.Empty');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_google_protobuf_Empty(buffer_arg) {
  return google_protobuf_empty_pb.Empty.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_strategie_CreateStratRequest(arg) {
  if (!(arg instanceof strat_pb.CreateStratRequest)) {
    throw new Error('Expected argument of type strategie.CreateStratRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_strategie_CreateStratRequest(buffer_arg) {
  return strat_pb.CreateStratRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_strategie_CreateStratResponse(arg) {
  if (!(arg instanceof strat_pb.CreateStratResponse)) {
    throw new Error('Expected argument of type strategie.CreateStratResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_strategie_CreateStratResponse(buffer_arg) {
  return strat_pb.CreateStratResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_strategie_GetStratRequest(arg) {
  if (!(arg instanceof strat_pb.GetStratRequest)) {
    throw new Error('Expected argument of type strategie.GetStratRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_strategie_GetStratRequest(buffer_arg) {
  return strat_pb.GetStratRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_strategie_GetStratResponse(arg) {
  if (!(arg instanceof strat_pb.GetStratResponse)) {
    throw new Error('Expected argument of type strategie.GetStratResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_strategie_GetStratResponse(buffer_arg) {
  return strat_pb.GetStratResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_strategie_GetUserStrategiesRequest(arg) {
  if (!(arg instanceof strat_pb.GetUserStrategiesRequest)) {
    throw new Error('Expected argument of type strategie.GetUserStrategiesRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_strategie_GetUserStrategiesRequest(buffer_arg) {
  return strat_pb.GetUserStrategiesRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_strategie_GetUserStrategiesResponse(arg) {
  if (!(arg instanceof strat_pb.GetUserStrategiesResponse)) {
    throw new Error('Expected argument of type strategie.GetUserStrategiesResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_strategie_GetUserStrategiesResponse(buffer_arg) {
  return strat_pb.GetUserStrategiesResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_strategie_HealthCheckResponse(arg) {
  if (!(arg instanceof strat_pb.HealthCheckResponse)) {
    throw new Error('Expected argument of type strategie.HealthCheckResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_strategie_HealthCheckResponse(buffer_arg) {
  return strat_pb.HealthCheckResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var StrategeServiceService = exports.StrategeServiceService = {
  getStrategie: {
    path: '/strategie.StrategeService/GetStrategie',
    requestStream: false,
    responseStream: false,
    requestType: strat_pb.GetStratRequest,
    responseType: strat_pb.GetStratResponse,
    requestSerialize: serialize_strategie_GetStratRequest,
    requestDeserialize: deserialize_strategie_GetStratRequest,
    responseSerialize: serialize_strategie_GetStratResponse,
    responseDeserialize: deserialize_strategie_GetStratResponse,
  },
  getUserStrategies: {
    path: '/strategie.StrategeService/GetUserStrategies',
    requestStream: false,
    responseStream: false,
    requestType: strat_pb.GetUserStrategiesRequest,
    responseType: strat_pb.GetUserStrategiesResponse,
    requestSerialize: serialize_strategie_GetUserStrategiesRequest,
    requestDeserialize: deserialize_strategie_GetUserStrategiesRequest,
    responseSerialize: serialize_strategie_GetUserStrategiesResponse,
    responseDeserialize: deserialize_strategie_GetUserStrategiesResponse,
  },
  createStrategie: {
    path: '/strategie.StrategeService/CreateStrategie',
    requestStream: false,
    responseStream: false,
    requestType: strat_pb.CreateStratRequest,
    responseType: strat_pb.CreateStratResponse,
    requestSerialize: serialize_strategie_CreateStratRequest,
    requestDeserialize: deserialize_strategie_CreateStratRequest,
    responseSerialize: serialize_strategie_CreateStratResponse,
    responseDeserialize: deserialize_strategie_CreateStratResponse,
  },
  healthCheck: {
    path: '/strategie.StrategeService/HealthCheck',
    requestStream: false,
    responseStream: false,
    requestType: google_protobuf_empty_pb.Empty,
    responseType: strat_pb.HealthCheckResponse,
    requestSerialize: serialize_google_protobuf_Empty,
    requestDeserialize: deserialize_google_protobuf_Empty,
    responseSerialize: serialize_strategie_HealthCheckResponse,
    responseDeserialize: deserialize_strategie_HealthCheckResponse,
  },
};

exports.StrategeServiceClient = grpc.makeGenericClientConstructor(StrategeServiceService);
