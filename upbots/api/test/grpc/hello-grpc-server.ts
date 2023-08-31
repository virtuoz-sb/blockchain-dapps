/*
  demo grpc server (see https://github.com/grpc/grpc/blob/master/examples/node/static_codegen/greeter_server.js)
  exec this file using ts-node by running 'npm run grpc:hello'
*/
import * as grpc from "grpc";
import { Logger } from "@nestjs/common";
import * as messages from "../../src/proto/greeter/greeter_pb";
import * as services from "../../src/proto/greeter/greeter_grpc_pb";

const logger = new Logger("grpc.Server");

/**
 * Implements the SayHello RPC method.
 */
function sayHello(call: grpc.ServerUnaryCall<messages.HelloRequest>, callback: grpc.sendUnaryData<messages.HelloResponse>) {
  const reply = new messages.HelloResponse();
  reply.setMessage(`Hello ${call.request.getName()}`);
  callback(null, reply);
}

/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
function main() {
  const server = new grpc.Server();
  server.addService(services.GreeterService, { sayHello });
  const url = "0.0.0.0:50051";
  server.bind(url, grpc.ServerCredentials.createInsecure());
  logger.log(`hello grpc server starts on url ${url} ..`);
  server.start();
}
logger.log("hello grpc server..");
main();
