import { credentials, ChannelCredentials } from "grpc";
import { Logger } from "@nestjs/common";

export class GrpcConnectionOptionProvider {
  private readonly logger = new Logger(GrpcConnectionOptionProvider.name);

  get(): GrpcConnectionOptions {
    if (!process.env.GRPC_ADDRESS) {
      throw new Error(`GrpcConnectionOptionProvider missing config GRPC_ADDRESS '${process.env.GRPC_ADDRESS}'`);
    }

    return {
      address: process.env.GRPC_ADDRESS,
      credentials: credentials.createInsecure(), // TODO: secure grpc
      options: null,
    };

    // if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    //   return {
    //     address: 'localhost:3001',
    //     credentials: credentials.createInsecure(), // TODO: secure grpc
    //     options: null,
    //   };
    // }
  }
}

export interface GrpcConnectionOptions {
  address: string;
  credentials: ChannelCredentials;
  options: Record<string, any>;
}
