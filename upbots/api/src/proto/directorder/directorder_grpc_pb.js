// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var directorder_pb = require('./directorder_pb.js');

function serialize_directorder_DirectOrderCancelRequest(arg) {
  if (!(arg instanceof directorder_pb.DirectOrderCancelRequest)) {
    throw new Error('Expected argument of type directorder.DirectOrderCancelRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_directorder_DirectOrderCancelRequest(buffer_arg) {
  return directorder_pb.DirectOrderCancelRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_directorder_DirectOrderCancelResponse(arg) {
  if (!(arg instanceof directorder_pb.DirectOrderCancelResponse)) {
    throw new Error('Expected argument of type directorder.DirectOrderCancelResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_directorder_DirectOrderCancelResponse(buffer_arg) {
  return directorder_pb.DirectOrderCancelResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_directorder_DirectOrderRequest(arg) {
  if (!(arg instanceof directorder_pb.DirectOrderRequest)) {
    throw new Error('Expected argument of type directorder.DirectOrderRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_directorder_DirectOrderRequest(buffer_arg) {
  return directorder_pb.DirectOrderRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_directorder_DirectOrderResponse(arg) {
  if (!(arg instanceof directorder_pb.DirectOrderResponse)) {
    throw new Error('Expected argument of type directorder.DirectOrderResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_directorder_DirectOrderResponse(buffer_arg) {
  return directorder_pb.DirectOrderResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var DirectOrderServiceService = exports.DirectOrderServiceService = {
  placeDirectOrder: {
    path: '/directorder.DirectOrderService/PlaceDirectOrder',
    requestStream: false,
    responseStream: false,
    requestType: directorder_pb.DirectOrderRequest,
    responseType: directorder_pb.DirectOrderResponse,
    requestSerialize: serialize_directorder_DirectOrderRequest,
    requestDeserialize: deserialize_directorder_DirectOrderRequest,
    responseSerialize: serialize_directorder_DirectOrderResponse,
    responseDeserialize: deserialize_directorder_DirectOrderResponse,
  },
  cancelDirectOrder: {
    path: '/directorder.DirectOrderService/CancelDirectOrder',
    requestStream: false,
    responseStream: false,
    requestType: directorder_pb.DirectOrderCancelRequest,
    responseType: directorder_pb.DirectOrderCancelResponse,
    requestSerialize: serialize_directorder_DirectOrderCancelRequest,
    requestDeserialize: deserialize_directorder_DirectOrderCancelRequest,
    responseSerialize: serialize_directorder_DirectOrderCancelResponse,
    responseDeserialize: deserialize_directorder_DirectOrderCancelResponse,
  },
};

exports.DirectOrderServiceClient = grpc.makeGenericClientConstructor(DirectOrderServiceService);
