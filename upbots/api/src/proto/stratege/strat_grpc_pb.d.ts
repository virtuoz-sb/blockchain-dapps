// package: strategie
// file: strat.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "grpc";
import * as strat_pb from "./strat_pb";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

interface IStrategeServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    getStrategie: IStrategeServiceService_IGetStrategie;
    getUserStrategies: IStrategeServiceService_IGetUserStrategies;
    createStrategie: IStrategeServiceService_ICreateStrategie;
    healthCheck: IStrategeServiceService_IHealthCheck;
}

interface IStrategeServiceService_IGetStrategie extends grpc.MethodDefinition<strat_pb.GetStratRequest, strat_pb.GetStratResponse> {
    path: string; // "/strategie.StrategeService/GetStrategie"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<strat_pb.GetStratRequest>;
    requestDeserialize: grpc.deserialize<strat_pb.GetStratRequest>;
    responseSerialize: grpc.serialize<strat_pb.GetStratResponse>;
    responseDeserialize: grpc.deserialize<strat_pb.GetStratResponse>;
}
interface IStrategeServiceService_IGetUserStrategies extends grpc.MethodDefinition<strat_pb.GetUserStrategiesRequest, strat_pb.GetUserStrategiesResponse> {
    path: string; // "/strategie.StrategeService/GetUserStrategies"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<strat_pb.GetUserStrategiesRequest>;
    requestDeserialize: grpc.deserialize<strat_pb.GetUserStrategiesRequest>;
    responseSerialize: grpc.serialize<strat_pb.GetUserStrategiesResponse>;
    responseDeserialize: grpc.deserialize<strat_pb.GetUserStrategiesResponse>;
}
interface IStrategeServiceService_ICreateStrategie extends grpc.MethodDefinition<strat_pb.CreateStratRequest, strat_pb.CreateStratResponse> {
    path: string; // "/strategie.StrategeService/CreateStrategie"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<strat_pb.CreateStratRequest>;
    requestDeserialize: grpc.deserialize<strat_pb.CreateStratRequest>;
    responseSerialize: grpc.serialize<strat_pb.CreateStratResponse>;
    responseDeserialize: grpc.deserialize<strat_pb.CreateStratResponse>;
}
interface IStrategeServiceService_IHealthCheck extends grpc.MethodDefinition<google_protobuf_empty_pb.Empty, strat_pb.HealthCheckResponse> {
    path: string; // "/strategie.StrategeService/HealthCheck"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<google_protobuf_empty_pb.Empty>;
    requestDeserialize: grpc.deserialize<google_protobuf_empty_pb.Empty>;
    responseSerialize: grpc.serialize<strat_pb.HealthCheckResponse>;
    responseDeserialize: grpc.deserialize<strat_pb.HealthCheckResponse>;
}

export const StrategeServiceService: IStrategeServiceService;

export interface IStrategeServiceServer {
    getStrategie: grpc.handleUnaryCall<strat_pb.GetStratRequest, strat_pb.GetStratResponse>;
    getUserStrategies: grpc.handleUnaryCall<strat_pb.GetUserStrategiesRequest, strat_pb.GetUserStrategiesResponse>;
    createStrategie: grpc.handleUnaryCall<strat_pb.CreateStratRequest, strat_pb.CreateStratResponse>;
    healthCheck: grpc.handleUnaryCall<google_protobuf_empty_pb.Empty, strat_pb.HealthCheckResponse>;
}

export interface IStrategeServiceClient {
    getStrategie(request: strat_pb.GetStratRequest, callback: (error: grpc.ServiceError | null, response: strat_pb.GetStratResponse) => void): grpc.ClientUnaryCall;
    getStrategie(request: strat_pb.GetStratRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: strat_pb.GetStratResponse) => void): grpc.ClientUnaryCall;
    getStrategie(request: strat_pb.GetStratRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: strat_pb.GetStratResponse) => void): grpc.ClientUnaryCall;
    getUserStrategies(request: strat_pb.GetUserStrategiesRequest, callback: (error: grpc.ServiceError | null, response: strat_pb.GetUserStrategiesResponse) => void): grpc.ClientUnaryCall;
    getUserStrategies(request: strat_pb.GetUserStrategiesRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: strat_pb.GetUserStrategiesResponse) => void): grpc.ClientUnaryCall;
    getUserStrategies(request: strat_pb.GetUserStrategiesRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: strat_pb.GetUserStrategiesResponse) => void): grpc.ClientUnaryCall;
    createStrategie(request: strat_pb.CreateStratRequest, callback: (error: grpc.ServiceError | null, response: strat_pb.CreateStratResponse) => void): grpc.ClientUnaryCall;
    createStrategie(request: strat_pb.CreateStratRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: strat_pb.CreateStratResponse) => void): grpc.ClientUnaryCall;
    createStrategie(request: strat_pb.CreateStratRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: strat_pb.CreateStratResponse) => void): grpc.ClientUnaryCall;
    healthCheck(request: google_protobuf_empty_pb.Empty, callback: (error: grpc.ServiceError | null, response: strat_pb.HealthCheckResponse) => void): grpc.ClientUnaryCall;
    healthCheck(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: strat_pb.HealthCheckResponse) => void): grpc.ClientUnaryCall;
    healthCheck(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: strat_pb.HealthCheckResponse) => void): grpc.ClientUnaryCall;
}

export class StrategeServiceClient extends grpc.Client implements IStrategeServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public getStrategie(request: strat_pb.GetStratRequest, callback: (error: grpc.ServiceError | null, response: strat_pb.GetStratResponse) => void): grpc.ClientUnaryCall;
    public getStrategie(request: strat_pb.GetStratRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: strat_pb.GetStratResponse) => void): grpc.ClientUnaryCall;
    public getStrategie(request: strat_pb.GetStratRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: strat_pb.GetStratResponse) => void): grpc.ClientUnaryCall;
    public getUserStrategies(request: strat_pb.GetUserStrategiesRequest, callback: (error: grpc.ServiceError | null, response: strat_pb.GetUserStrategiesResponse) => void): grpc.ClientUnaryCall;
    public getUserStrategies(request: strat_pb.GetUserStrategiesRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: strat_pb.GetUserStrategiesResponse) => void): grpc.ClientUnaryCall;
    public getUserStrategies(request: strat_pb.GetUserStrategiesRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: strat_pb.GetUserStrategiesResponse) => void): grpc.ClientUnaryCall;
    public createStrategie(request: strat_pb.CreateStratRequest, callback: (error: grpc.ServiceError | null, response: strat_pb.CreateStratResponse) => void): grpc.ClientUnaryCall;
    public createStrategie(request: strat_pb.CreateStratRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: strat_pb.CreateStratResponse) => void): grpc.ClientUnaryCall;
    public createStrategie(request: strat_pb.CreateStratRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: strat_pb.CreateStratResponse) => void): grpc.ClientUnaryCall;
    public healthCheck(request: google_protobuf_empty_pb.Empty, callback: (error: grpc.ServiceError | null, response: strat_pb.HealthCheckResponse) => void): grpc.ClientUnaryCall;
    public healthCheck(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: strat_pb.HealthCheckResponse) => void): grpc.ClientUnaryCall;
    public healthCheck(request: google_protobuf_empty_pb.Empty, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: strat_pb.HealthCheckResponse) => void): grpc.ClientUnaryCall;
}
