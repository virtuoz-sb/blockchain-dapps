import { GatewayMetadata } from "@nestjs/websockets";
import { Logger } from "@nestjs/common";

const wsOptions = {
  handlePreflightRequest: (req, res) => {
    const whiteList = process.env.FRONT_URL ? process.env.FRONT_URL.split(" ") : "";
    let headers = {};
    if (whiteList.indexOf(req.headers.origin) !== -1) {
      headers = {
        "Access-Control-Allow-Headers": "Content-Type, authorization",
        "Access-Control-Allow-Origin": req.headers.origin,
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Max-Age": "1728000",
        "Content-Length": "0",
      };
    } else {
      Logger.log(
        `handlePreflightRequest denies origin ${req.headers.origin} as its not on the CORS whitelist`,
        "WebSocketGateway-handlePreflightRequest"
      );
    }
    res.writeHead(200, headers);
    res.end();
  },
  // TODO:  enable namespace: @WebSocketGateway(80, { namespace: 'events' })
} as GatewayMetadata;
export default wsOptions;
