// package: algobot
// file: algobot.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class FollowBotRequest extends jspb.Message { 
    getBotid(): string;
    setBotid(value: string): void;

    getUserid(): string;
    setUserid(value: string): void;

    getApikeyid(): string;
    setApikeyid(value: string): void;

    getStrattype(): string;
    setStrattype(value: string): void;

    getAccounttype(): string;
    setAccounttype(value: string): void;

    getAccountpercentage(): number;
    setAccountpercentage(value: number): void;

    getAccountleverage(): number;
    setAccountleverage(value: number): void;

    getContractsize(): number;
    setContractsize(value: number): void;

    getBaseamount(): number;
    setBaseamount(value: number): void;

    getPositiontype(): string;
    setPositiontype(value: string): void;

    getPositionamount(): number;
    setPositionamount(value: number): void;

    getQuote(): string;
    setQuote(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): FollowBotRequest.AsObject;
    static toObject(includeInstance: boolean, msg: FollowBotRequest): FollowBotRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: FollowBotRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): FollowBotRequest;
    static deserializeBinaryFromReader(message: FollowBotRequest, reader: jspb.BinaryReader): FollowBotRequest;
}

export namespace FollowBotRequest {
    export type AsObject = {
        botid: string,
        userid: string,
        apikeyid: string,
        strattype: string,
        accounttype: string,
        accountpercentage: number,
        accountleverage: number,
        contractsize: number,
        baseamount: number,
        positiontype: string,
        positionamount: number,
        quote: string,
    }
}

export class FollowBotResponse extends jspb.Message { 
    getBotid(): string;
    setBotid(value: string): void;

    getSubscriptionid(): string;
    setSubscriptionid(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): FollowBotResponse.AsObject;
    static toObject(includeInstance: boolean, msg: FollowBotResponse): FollowBotResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: FollowBotResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): FollowBotResponse;
    static deserializeBinaryFromReader(message: FollowBotResponse, reader: jspb.BinaryReader): FollowBotResponse;
}

export namespace FollowBotResponse {
    export type AsObject = {
        botid: string,
        subscriptionid: string,
    }
}

export class UserBotSubscriptionPauseRequest extends jspb.Message { 
    getSubid(): string;
    setSubid(value: string): void;

    getAction(): PauseActionType;
    setAction(value: PauseActionType): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UserBotSubscriptionPauseRequest.AsObject;
    static toObject(includeInstance: boolean, msg: UserBotSubscriptionPauseRequest): UserBotSubscriptionPauseRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UserBotSubscriptionPauseRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UserBotSubscriptionPauseRequest;
    static deserializeBinaryFromReader(message: UserBotSubscriptionPauseRequest, reader: jspb.BinaryReader): UserBotSubscriptionPauseRequest;
}

export namespace UserBotSubscriptionPauseRequest {
    export type AsObject = {
        subid: string,
        action: PauseActionType,
    }
}

export class UserBotSubscriptionPauseResponse extends jspb.Message { 
    getSubid(): string;
    setSubid(value: string): void;

    getEnabled(): boolean;
    setEnabled(value: boolean): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UserBotSubscriptionPauseResponse.AsObject;
    static toObject(includeInstance: boolean, msg: UserBotSubscriptionPauseResponse): UserBotSubscriptionPauseResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UserBotSubscriptionPauseResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UserBotSubscriptionPauseResponse;
    static deserializeBinaryFromReader(message: UserBotSubscriptionPauseResponse, reader: jspb.BinaryReader): UserBotSubscriptionPauseResponse;
}

export namespace UserBotSubscriptionPauseResponse {
    export type AsObject = {
        subid: string,
        enabled: boolean,
    }
}

export class DeleteSubscriptionRequest extends jspb.Message { 
    getSubid(): string;
    setSubid(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DeleteSubscriptionRequest.AsObject;
    static toObject(includeInstance: boolean, msg: DeleteSubscriptionRequest): DeleteSubscriptionRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DeleteSubscriptionRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DeleteSubscriptionRequest;
    static deserializeBinaryFromReader(message: DeleteSubscriptionRequest, reader: jspb.BinaryReader): DeleteSubscriptionRequest;
}

export namespace DeleteSubscriptionRequest {
    export type AsObject = {
        subid: string,
    }
}

export class DeleteSubscriptionResponse extends jspb.Message { 
    getAck(): string;
    setAck(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DeleteSubscriptionResponse.AsObject;
    static toObject(includeInstance: boolean, msg: DeleteSubscriptionResponse): DeleteSubscriptionResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DeleteSubscriptionResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DeleteSubscriptionResponse;
    static deserializeBinaryFromReader(message: DeleteSubscriptionResponse, reader: jspb.BinaryReader): DeleteSubscriptionResponse;
}

export namespace DeleteSubscriptionResponse {
    export type AsObject = {
        ack: string,
    }
}

export enum PauseActionType {
    NOT_ACTION_TYPE_SET = 0,
    PAUSE = 1,
    RESUME = 2,
}
