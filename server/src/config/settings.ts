import {configProd} from "./config.prod"
import {configDev} from "./config.dev"

export interface ConfigType {
    port: number
}

const getSettings = (): ConfigType =>  {
    const nodeEnv = process.env.NODE_ENV || 'dev'
    return nodeEnv.includes('prod')? configProd: configDev
}

export default getSettings()
