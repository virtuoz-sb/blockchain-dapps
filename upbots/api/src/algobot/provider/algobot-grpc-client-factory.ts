import { Provider } from "@nestjs/common/interfaces/modules/provider.interface";
import { Logger } from "@nestjs/common";
import { GrpcConnectionOptionProvider } from "../../shared/grpc-connection-option.provider";
import { AlgobotServiceClient } from "../../proto/algobot/algobot_grpc_pb";

export const GRPC_CLIENT_ALGOBOT = "GRPC_CLIENT_ALGOBOT";

export const AlgobotGrpcClientFactory: Provider<AlgobotServiceClient> = {
  provide: GRPC_CLIENT_ALGOBOT,
  useFactory: (optionsProvider: GrpcConnectionOptionProvider) => {
    const o = optionsProvider.get();
    Logger.debug(`GrpcConnectionOptionProvider :${JSON.stringify(o)}`, "GrpcConnectionFactory");
    return new AlgobotServiceClient(o.address, o.credentials, o.options);
  },
  inject: [GrpcConnectionOptionProvider],
};
