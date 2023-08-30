import pino from "pino";
import config from "./config";

export default pino({
  timestamp: true,
  level: config.LOG_LEVEL as string,
});
