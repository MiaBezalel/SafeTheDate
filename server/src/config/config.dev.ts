import {ConfigType} from "./settings"

export const configDev: ConfigType = {
    port: Number(process.env.PORT) || 4000
}
