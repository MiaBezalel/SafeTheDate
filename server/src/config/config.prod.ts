import {ConfigType} from "./settings"

export const configProd: ConfigType = {
    port: Number(process.env.PORT)
}
