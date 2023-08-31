// package: strategie
// file: strat.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

export class Market extends jspb.Message { 
    getExchange(): string;
    setExchange(value: string): void;

    getSymbol(): string;
    setSymbol(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Market.AsObject;
    static toObject(includeInstance: boolean, msg: Market): Market.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Market, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Market;
    static deserializeBinaryFromReader(message: Market, reader: jspb.BinaryReader): Market;
}

export namespace Market {
    export type AsObject = {
        exchange: string,
        symbol: string,
    }
}

export class TakeProfit extends jspb.Message { 
    getStatus(): TargetType;
    setStatus(value: TargetType): void;

    getTrigger(): number;
    setTrigger(value: number): void;

    getQuantity(): number;
    setQuantity(value: number): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TakeProfit.AsObject;
    static toObject(includeInstance: boolean, msg: TakeProfit): TakeProfit.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TakeProfit, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TakeProfit;
    static deserializeBinaryFromReader(message: TakeProfit, reader: jspb.BinaryReader): TakeProfit;
}

export namespace TakeProfit {
    export type AsObject = {
        status: TargetType,
        trigger: number,
        quantity: number,
    }
}

export class AccountInfo extends jspb.Message { 
    getUserid(): string;
    setUserid(value: string): void;

    getApikeyid(): string;
    setApikeyid(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): AccountInfo.AsObject;
    static toObject(includeInstance: boolean, msg: AccountInfo): AccountInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: AccountInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): AccountInfo;
    static deserializeBinaryFromReader(message: AccountInfo, reader: jspb.BinaryReader): AccountInfo;
}

export namespace AccountInfo {
    export type AsObject = {
        userid: string,
        apikeyid: string,
    }
}

export class Entry extends jspb.Message { 
    getMarketentry(): boolean;
    setMarketentry(value: boolean): void;

    getLimitentry(): boolean;
    setLimitentry(value: boolean): void;

    getTriggerprice(): number;
    setTriggerprice(value: number): void;

    getLimitprice(): number;
    setLimitprice(value: number): void;

    getQuantity(): number;
    setQuantity(value: number): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Entry.AsObject;
    static toObject(includeInstance: boolean, msg: Entry): Entry.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Entry, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Entry;
    static deserializeBinaryFromReader(message: Entry, reader: jspb.BinaryReader): Entry;
}

export namespace Entry {
    export type AsObject = {
        marketentry: boolean,
        limitentry: boolean,
        triggerprice: number,
        limitprice: number,
        quantity: number,
    }
}

export class Strategy extends jspb.Message { 
    getEntryrangefrom(): number;
    setEntryrangefrom(value: number): void;

    getEntryrangeto(): number;
    setEntryrangeto(value: number): void;

    getStoploss(): number;
    setStoploss(value: number): void;

    getSide(): SideType;
    setSide(value: SideType): void;

    getVolume(): number;
    setVolume(value: number): void;


    hasMarket(): boolean;
    clearMarket(): void;
    getMarket(): Market | undefined;
    setMarket(value?: Market): void;

    clearTakeprofitsList(): void;
    getTakeprofitsList(): Array<TakeProfit>;
    setTakeprofitsList(value: Array<TakeProfit>): void;
    addTakeprofits(value?: TakeProfit, index?: number): TakeProfit;

    getGuid(): string;
    setGuid(value: string): void;


    hasAccount(): boolean;
    clearAccount(): void;
    getAccount(): AccountInfo | undefined;
    setAccount(value?: AccountInfo): void;


    hasCreatedAt(): boolean;
    clearCreatedAt(): void;
    getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): void;


    hasUpdatedAt(): boolean;
    clearUpdatedAt(): void;
    getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): void;

    getPhase(): Phase;
    setPhase(value: Phase): void;

    clearEntriesList(): void;
    getEntriesList(): Array<Entry>;
    setEntriesList(value: Array<Entry>): void;
    addEntries(value?: Entry, index?: number): Entry;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Strategy.AsObject;
    static toObject(includeInstance: boolean, msg: Strategy): Strategy.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Strategy, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Strategy;
    static deserializeBinaryFromReader(message: Strategy, reader: jspb.BinaryReader): Strategy;
}

export namespace Strategy {
    export type AsObject = {
        entryrangefrom: number,
        entryrangeto: number,
        stoploss: number,
        side: SideType,
        volume: number,
        market?: Market.AsObject,
        takeprofitsList: Array<TakeProfit.AsObject>,
        guid: string,
        account?: AccountInfo.AsObject,
        createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        phase: Phase,
        entriesList: Array<Entry.AsObject>,
    }
}

export class GetStratRequest extends jspb.Message { 
    getGuid(): string;
    setGuid(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetStratRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetStratRequest): GetStratRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetStratRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetStratRequest;
    static deserializeBinaryFromReader(message: GetStratRequest, reader: jspb.BinaryReader): GetStratRequest;
}

export namespace GetStratRequest {
    export type AsObject = {
        guid: string,
    }
}

export class GetStratResponse extends jspb.Message { 

    hasStrat(): boolean;
    clearStrat(): void;
    getStrat(): Strategy | undefined;
    setStrat(value?: Strategy): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetStratResponse.AsObject;
    static toObject(includeInstance: boolean, msg: GetStratResponse): GetStratResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetStratResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetStratResponse;
    static deserializeBinaryFromReader(message: GetStratResponse, reader: jspb.BinaryReader): GetStratResponse;
}

export namespace GetStratResponse {
    export type AsObject = {
        strat?: Strategy.AsObject,
    }
}

export class GetUserStrategiesRequest extends jspb.Message { 
    getUserid(): string;
    setUserid(value: string): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetUserStrategiesRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetUserStrategiesRequest): GetUserStrategiesRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetUserStrategiesRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetUserStrategiesRequest;
    static deserializeBinaryFromReader(message: GetUserStrategiesRequest, reader: jspb.BinaryReader): GetUserStrategiesRequest;
}

export namespace GetUserStrategiesRequest {
    export type AsObject = {
        userid: string,
    }
}

export class GetUserStrategiesResponse extends jspb.Message { 
    clearStratsList(): void;
    getStratsList(): Array<Strategy>;
    setStratsList(value: Array<Strategy>): void;
    addStrats(value?: Strategy, index?: number): Strategy;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetUserStrategiesResponse.AsObject;
    static toObject(includeInstance: boolean, msg: GetUserStrategiesResponse): GetUserStrategiesResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetUserStrategiesResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetUserStrategiesResponse;
    static deserializeBinaryFromReader(message: GetUserStrategiesResponse, reader: jspb.BinaryReader): GetUserStrategiesResponse;
}

export namespace GetUserStrategiesResponse {
    export type AsObject = {
        stratsList: Array<Strategy.AsObject>,
    }
}

export class CreateStratRequest extends jspb.Message { 
    clearEntriesList(): void;
    getEntriesList(): Array<Entry>;
    setEntriesList(value: Array<Entry>): void;
    addEntries(value?: Entry, index?: number): Entry;

    getEntryrangefrom(): number;
    setEntryrangefrom(value: number): void;

    getEntryrangeto(): number;
    setEntryrangeto(value: number): void;

    clearTakeprofitsList(): void;
    getTakeprofitsList(): Array<TakeProfit>;
    setTakeprofitsList(value: Array<TakeProfit>): void;
    addTakeprofits(value?: TakeProfit, index?: number): TakeProfit;

    getStoploss(): number;
    setStoploss(value: number): void;

    getSide(): SideType;
    setSide(value: SideType): void;

    getVolume(): number;
    setVolume(value: number): void;


    hasMarket(): boolean;
    clearMarket(): void;
    getMarket(): Market | undefined;
    setMarket(value?: Market): void;


    hasAccount(): boolean;
    clearAccount(): void;
    getAccount(): AccountInfo | undefined;
    setAccount(value?: AccountInfo): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreateStratRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CreateStratRequest): CreateStratRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreateStratRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreateStratRequest;
    static deserializeBinaryFromReader(message: CreateStratRequest, reader: jspb.BinaryReader): CreateStratRequest;
}

export namespace CreateStratRequest {
    export type AsObject = {
        entriesList: Array<Entry.AsObject>,
        entryrangefrom: number,
        entryrangeto: number,
        takeprofitsList: Array<TakeProfit.AsObject>,
        stoploss: number,
        side: SideType,
        volume: number,
        market?: Market.AsObject,
        account?: AccountInfo.AsObject,
    }
}

export class CreateStratResponse extends jspb.Message { 

    hasStrat(): boolean;
    clearStrat(): void;
    getStrat(): Strategy | undefined;
    setStrat(value?: Strategy): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreateStratResponse.AsObject;
    static toObject(includeInstance: boolean, msg: CreateStratResponse): CreateStratResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreateStratResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreateStratResponse;
    static deserializeBinaryFromReader(message: CreateStratResponse, reader: jspb.BinaryReader): CreateStratResponse;
}

export namespace CreateStratResponse {
    export type AsObject = {
        strat?: Strategy.AsObject,
    }
}

export class HealthCheckResponse extends jspb.Message { 
    getOkstatus(): boolean;
    setOkstatus(value: boolean): void;


    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): HealthCheckResponse.AsObject;
    static toObject(includeInstance: boolean, msg: HealthCheckResponse): HealthCheckResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: HealthCheckResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): HealthCheckResponse;
    static deserializeBinaryFromReader(message: HealthCheckResponse, reader: jspb.BinaryReader): HealthCheckResponse;
}

export namespace HealthCheckResponse {
    export type AsObject = {
        okstatus: boolean,
    }
}

export enum Phase {
    NOPHASESET = 0,
    WAITINGFORENTRY = 1,
    ENTRYREQUESTED = 2,
    ENTEREDPARTIAL = 3,
    ENTERED = 4,
    TAKEPROFITREQUESTED = 5,
    TAKEPROFITREACHED = 6,
    STRATLOCKEDSTATE = 7,
    CLOSEDBYENTRYMISSED = 8,
    CLOSINGBYSTOPLOSS = 9,
    CLOSINGBYTAKEPROFIT = 10,
    CLOSEDBYSTOPLOSS = 11,
    CLOSEDBYTAKEPROFIT = 12,
    ORDERCANCELLEDBYUSER = 13,
    STATUSERROR = 14,
}

export enum SideType {
    UNKNOWN_SIDE_TYPE = 0,
    BUY = 1,
    SELL = 2,
}

export enum TargetType {
    NOT_SET = 0,
    REQUESTED = 1,
    REACHED = 2,
}
