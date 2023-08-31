import { API_URL } from "@torobot/shared";
import { Gateway } from "./server/gateway";

const port = 3001;
const originURL = API_URL;
const gateway = new Gateway(port, originURL);
gateway.start();