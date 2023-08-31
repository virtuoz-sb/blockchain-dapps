import { Provider } from "@nestjs/common/interfaces/modules/provider.interface";
import { Logger } from "@nestjs/common";
import { GrpcConnectionOptionProvider } from "../../shared/grpc-connection-option.provider";
import { StrategeServiceClient } from "../../proto/stratege/strat_grpc_pb";

export const GRPC_STRATEGE_CLIENT = "GRPC_STRATEGE_CLIENT";

export const StrategeGrpcClientFactory: Provider<StrategeServiceClient> = {
  provide: GRPC_STRATEGE_CLIENT,
  useFactory: (optionsProvider: GrpcConnectionOptionProvider) => {
    const o = optionsProvider.get();
    Logger.debug(`GrpcConnectionOptionProvider :${JSON.stringify(o)}`, "StrategeGrpcClientFactory");
    return new StrategeServiceClient(o.address, o.credentials, o.options);
  },
  inject: [GrpcConnectionOptionProvider],
};
