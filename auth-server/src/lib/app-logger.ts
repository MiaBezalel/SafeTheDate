import { ILogger } from "../utils/logger"

let appLogger: ILogger | null = null

export const configureLogger = (logger: ILogger) => {
  appLogger = logger
}

export default () => {
  if (!appLogger) {
    throw new Error("Did not configure the global logger on server startup")
  }
  return appLogger
}
