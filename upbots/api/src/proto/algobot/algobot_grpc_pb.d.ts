// package: algobot
// file: algobot.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "grpc";
import * as algobot_pb from "./algobot_pb";

interface IAlgobotServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    followAlgobot: IAlgobotServiceService_IFollowAlgobot;
    pauseUnpause: IAlgobotServiceService_IPauseUnpause;
    deleteSubscription: IAlgobotServiceService_IDeleteSubscription;
}

interface IAlgobotServiceService_IFollowAlgobot extends grpc.MethodDefinition<algobot_pb.FollowBotRequest, algobot_pb.FollowBotResponse> {
    path: string; // "/algobot.AlgobotService/FollowAlgobot"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<algobot_pb.FollowBotRequest>;
    requestDeserialize: grpc.deserialize<algobot_pb.FollowBotRequest>;
    responseSerialize: grpc.serialize<algobot_pb.FollowBotResponse>;
    responseDeserialize: grpc.deserialize<algobot_pb.FollowBotResponse>;
}
interface IAlgobotServiceService_IPauseUnpause extends grpc.MethodDefinition<algobot_pb.UserBotSubscriptionPauseRequest, algobot_pb.UserBotSubscriptionPauseResponse> {
    path: string; // "/algobot.AlgobotService/PauseUnpause"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<algobot_pb.UserBotSubscriptionPauseRequest>;
    requestDeserialize: grpc.deserialize<algobot_pb.UserBotSubscriptionPauseRequest>;
    responseSerialize: grpc.serialize<algobot_pb.UserBotSubscriptionPauseResponse>;
    responseDeserialize: grpc.deserialize<algobot_pb.UserBotSubscriptionPauseResponse>;
}
interface IAlgobotServiceService_IDeleteSubscription extends grpc.MethodDefinition<algobot_pb.DeleteSubscriptionRequest, algobot_pb.DeleteSubscriptionResponse> {
    path: string; // "/algobot.AlgobotService/DeleteSubscription"
    requestStream: boolean; // false
    responseStream: boolean; // false
    requestSerialize: grpc.serialize<algobot_pb.DeleteSubscriptionRequest>;
    requestDeserialize: grpc.deserialize<algobot_pb.DeleteSubscriptionRequest>;
    responseSerialize: grpc.serialize<algobot_pb.DeleteSubscriptionResponse>;
    responseDeserialize: grpc.deserialize<algobot_pb.DeleteSubscriptionResponse>;
}

export const AlgobotServiceService: IAlgobotServiceService;

export interface IAlgobotServiceServer {
    followAlgobot: grpc.handleUnaryCall<algobot_pb.FollowBotRequest, algobot_pb.FollowBotResponse>;
    pauseUnpause: grpc.handleUnaryCall<algobot_pb.UserBotSubscriptionPauseRequest, algobot_pb.UserBotSubscriptionPauseResponse>;
    deleteSubscription: grpc.handleUnaryCall<algobot_pb.DeleteSubscriptionRequest, algobot_pb.DeleteSubscriptionResponse>;
}

export interface IAlgobotServiceClient {
    followAlgobot(request: algobot_pb.FollowBotRequest, callback: (error: grpc.ServiceError | null, response: algobot_pb.FollowBotResponse) => void): grpc.ClientUnaryCall;
    followAlgobot(request: algobot_pb.FollowBotRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: algobot_pb.FollowBotResponse) => void): grpc.ClientUnaryCall;
    followAlgobot(request: algobot_pb.FollowBotRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: algobot_pb.FollowBotResponse) => void): grpc.ClientUnaryCall;
    pauseUnpause(request: algobot_pb.UserBotSubscriptionPauseRequest, callback: (error: grpc.ServiceError | null, response: algobot_pb.UserBotSubscriptionPauseResponse) => void): grpc.ClientUnaryCall;
    pauseUnpause(request: algobot_pb.UserBotSubscriptionPauseRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: algobot_pb.UserBotSubscriptionPauseResponse) => void): grpc.ClientUnaryCall;
    pauseUnpause(request: algobot_pb.UserBotSubscriptionPauseRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: algobot_pb.UserBotSubscriptionPauseResponse) => void): grpc.ClientUnaryCall;
    deleteSubscription(request: algobot_pb.DeleteSubscriptionRequest, callback: (error: grpc.ServiceError | null, response: algobot_pb.DeleteSubscriptionResponse) => void): grpc.ClientUnaryCall;
    deleteSubscription(request: algobot_pb.DeleteSubscriptionRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: algobot_pb.DeleteSubscriptionResponse) => void): grpc.ClientUnaryCall;
    deleteSubscription(request: algobot_pb.DeleteSubscriptionRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: algobot_pb.DeleteSubscriptionResponse) => void): grpc.ClientUnaryCall;
}

export class AlgobotServiceClient extends grpc.Client implements IAlgobotServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public followAlgobot(request: algobot_pb.FollowBotRequest, callback: (error: grpc.ServiceError | null, response: algobot_pb.FollowBotResponse) => void): grpc.ClientUnaryCall;
    public followAlgobot(request: algobot_pb.FollowBotRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: algobot_pb.FollowBotResponse) => void): grpc.ClientUnaryCall;
    public followAlgobot(request: algobot_pb.FollowBotRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: algobot_pb.FollowBotResponse) => void): grpc.ClientUnaryCall;
    public pauseUnpause(request: algobot_pb.UserBotSubscriptionPauseRequest, callback: (error: grpc.ServiceError | null, response: algobot_pb.UserBotSubscriptionPauseResponse) => void): grpc.ClientUnaryCall;
    public pauseUnpause(request: algobot_pb.UserBotSubscriptionPauseRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: algobot_pb.UserBotSubscriptionPauseResponse) => void): grpc.ClientUnaryCall;
    public pauseUnpause(request: algobot_pb.UserBotSubscriptionPauseRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: algobot_pb.UserBotSubscriptionPauseResponse) => void): grpc.ClientUnaryCall;
    public deleteSubscription(request: algobot_pb.DeleteSubscriptionRequest, callback: (error: grpc.ServiceError | null, response: algobot_pb.DeleteSubscriptionResponse) => void): grpc.ClientUnaryCall;
    public deleteSubscription(request: algobot_pb.DeleteSubscriptionRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: algobot_pb.DeleteSubscriptionResponse) => void): grpc.ClientUnaryCall;
    public deleteSubscription(request: algobot_pb.DeleteSubscriptionRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: algobot_pb.DeleteSubscriptionResponse) => void): grpc.ClientUnaryCall;
}
