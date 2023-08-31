import { Logger } from "@torobot/shared";
import config from "./config";

export const logger = new Logger(config.LOG_DIR_PATH + `/engine.txt`)