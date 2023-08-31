// package: directorder
// file: directorder.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "grpc";
import * as directorder_pb from "./directorder_pb";

interface IDirectOrderServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    placeDirectOrder: IDirectOrderServiceService_IPlaceDirectOrder;
    cancelDirectOrder: IDirectOrderServiceService_ICancelDirectOrder;
}

interface IDirectOrderServiceService_IPlaceDirectOrder extends grpc.MethodDefinition<directorder_pb.DirectOrderRequest, directorder_pb.DirectOrderResponse> {
    path: string; // "/directorder.DirectOrderService/PlaceDirectOrder"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<directorder_pb.DirectOrderRequest>;
    requestDeserialize: grpc.deserialize<directorder_pb.DirectOrderRequest>;
    responseSerialize: grpc.serialize<directorder_pb.DirectOrderResponse>;
    responseDeserialize: grpc.deserialize<directorder_pb.DirectOrderResponse>;
}
interface IDirectOrderServiceService_ICancelDirectOrder extends grpc.MethodDefinition<directorder_pb.DirectOrderCancelRequest, directorder_pb.DirectOrderCancelResponse> {
    path: string; // "/directorder.DirectOrderService/CancelDirectOrder"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<directorder_pb.DirectOrderCancelRequest>;
    requestDeserialize: grpc.deserialize<directorder_pb.DirectOrderCancelRequest>;
    responseSerialize: grpc.serialize<directorder_pb.DirectOrderCancelResponse>;
    responseDeserialize: grpc.deserialize<directorder_pb.DirectOrderCancelResponse>;
}

export const DirectOrderServiceService: IDirectOrderServiceService;

export interface IDirectOrderServiceServer {
    placeDirectOrder: grpc.handleUnaryCall<directorder_pb.DirectOrderRequest, directorder_pb.DirectOrderResponse>;
    cancelDirectOrder: grpc.handleUnaryCall<directorder_pb.DirectOrderCancelRequest, directorder_pb.DirectOrderCancelResponse>;
}

export interface IDirectOrderServiceClient {
    placeDirectOrder(request: directorder_pb.DirectOrderRequest, callback: (error: grpc.ServiceError | null, response: directorder_pb.DirectOrderResponse) => void): grpc.ClientUnaryCall;
    placeDirectOrder(request: directorder_pb.DirectOrderRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: directorder_pb.DirectOrderResponse) => void): grpc.ClientUnaryCall;
    placeDirectOrder(request: directorder_pb.DirectOrderRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: directorder_pb.DirectOrderResponse) => void): grpc.ClientUnaryCall;
    cancelDirectOrder(request: directorder_pb.DirectOrderCancelRequest, callback: (error: grpc.ServiceError | null, response: directorder_pb.DirectOrderCancelResponse) => void): grpc.ClientUnaryCall;
    cancelDirectOrder(request: directorder_pb.DirectOrderCancelRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: directorder_pb.DirectOrderCancelResponse) => void): grpc.ClientUnaryCall;
    cancelDirectOrder(request: directorder_pb.DirectOrderCancelRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: directorder_pb.DirectOrderCancelResponse) => void): grpc.ClientUnaryCall;
}

export class DirectOrderServiceClient extends grpc.Client implements IDirectOrderServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public placeDirectOrder(request: directorder_pb.DirectOrderRequest, callback: (error: grpc.ServiceError | null, response: directorder_pb.DirectOrderResponse) => void): grpc.ClientUnaryCall;
    public placeDirectOrder(request: directorder_pb.DirectOrderRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: directorder_pb.DirectOrderResponse) => void): grpc.ClientUnaryCall;
    public placeDirectOrder(request: directorder_pb.DirectOrderRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: directorder_pb.DirectOrderResponse) => void): grpc.ClientUnaryCall;
    public cancelDirectOrder(request: directorder_pb.DirectOrderCancelRequest, callback: (error: grpc.ServiceError | null, response: directorder_pb.DirectOrderCancelResponse) => void): grpc.ClientUnaryCall;
    public cancelDirectOrder(request: directorder_pb.DirectOrderCancelRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: directorder_pb.DirectOrderCancelResponse) => void): grpc.ClientUnaryCall;
    public cancelDirectOrder(request: directorder_pb.DirectOrderCancelRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: directorder_pb.DirectOrderCancelResponse) => void): grpc.ClientUnaryCall;
}
