import { Provider } from "@nestjs/common/interfaces/modules/provider.interface";
import { Logger } from "@nestjs/common";
import { GrpcConnectionOptionProvider } from "../../shared/grpc-connection-option.provider";
import { DirectOrderServiceClient } from "../../proto/directorder/directorder_grpc_pb";

export const GRPC_DIRECT_ORDER_CLIENT = "GRPC_DIRECT_ORDER_CLIENT";

export const DirectOrderGrpcClientFactory: Provider<DirectOrderServiceClient> = {
  provide: GRPC_DIRECT_ORDER_CLIENT,
  useFactory: (optionsProvider: GrpcConnectionOptionProvider) => {
    const o = optionsProvider.get();
    Logger.debug(`GrpcConnectionOptionProvider :${JSON.stringify(o)}`, "DirectOrderGrpcClientFactory");
    return new DirectOrderServiceClient(o.address, o.credentials, o.options);
  },
  inject: [GrpcConnectionOptionProvider],
};
