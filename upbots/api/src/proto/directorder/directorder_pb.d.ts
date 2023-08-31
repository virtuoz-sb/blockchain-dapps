// package: directorder
// file: directorder.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class DirectOrderRequest extends jspb.Message { 
    getExchange(): string;
    setExchange(value: string): void;

    getSymbol(): string;
    setSymbol(value: string): void;

    getSide(): SideType;
    setSide(value: SideType): void;

    getUserid(): string;
    setUserid(value: string): void;

    getApikeyid(): string;
    setApikeyid(value: string): void;

    getType(): OrderType;
    setType(value: OrderType): void;

    getQuantity(): number;
    setQuantity(value: number): void;

    getPrice(): number;
    setPrice(value: number): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DirectOrderRequest.AsObject;
    static toObject(includeInstance: boolean, msg: DirectOrderRequest): DirectOrderRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DirectOrderRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DirectOrderRequest;
    static deserializeBinaryFromReader(message: DirectOrderRequest, reader: jspb.BinaryReader): DirectOrderRequest;
}

export namespace DirectOrderRequest {
    export type AsObject = {
        exchange: string,
        symbol: string,
        side: SideType,
        userid: string,
        apikeyid: string,
        type: OrderType,
        quantity: number,
        price: number,
    }
}

export class DirectOrderResponse extends jspb.Message { 
    getOrderid(): string;
    setOrderid(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DirectOrderResponse.AsObject;
    static toObject(includeInstance: boolean, msg: DirectOrderResponse): DirectOrderResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DirectOrderResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DirectOrderResponse;
    static deserializeBinaryFromReader(message: DirectOrderResponse, reader: jspb.BinaryReader): DirectOrderResponse;
}

export namespace DirectOrderResponse {
    export type AsObject = {
        orderid: string,
    }
}

export class DirectOrderCancelRequest extends jspb.Message { 
    getOrdertrackingid(): string;
    setOrdertrackingid(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DirectOrderCancelRequest.AsObject;
    static toObject(includeInstance: boolean, msg: DirectOrderCancelRequest): DirectOrderCancelRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DirectOrderCancelRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DirectOrderCancelRequest;
    static deserializeBinaryFromReader(message: DirectOrderCancelRequest, reader: jspb.BinaryReader): DirectOrderCancelRequest;
}

export namespace DirectOrderCancelRequest {
    export type AsObject = {
        ordertrackingid: string,
    }
}

export class DirectOrderCancelResponse extends jspb.Message { 
    getOkstatus(): boolean;
    setOkstatus(value: boolean): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DirectOrderCancelResponse.AsObject;
    static toObject(includeInstance: boolean, msg: DirectOrderCancelResponse): DirectOrderCancelResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DirectOrderCancelResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DirectOrderCancelResponse;
    static deserializeBinaryFromReader(message: DirectOrderCancelResponse, reader: jspb.BinaryReader): DirectOrderCancelResponse;
}

export namespace DirectOrderCancelResponse {
    export type AsObject = {
        okstatus: boolean,
    }
}

export enum SideType {
    UNKNOWN_SIDE_TYPE = 0,
    BUY = 1,
    SELL = 2,
}

export enum OrderType {
    UNKNOWN_ORDER_TYPE = 0,
    MARKET = 1,
    LIMIT = 2,
}
