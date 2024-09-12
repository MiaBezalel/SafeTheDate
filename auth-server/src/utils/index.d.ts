import { AccessTokenPayload } from "./types"

declare module "express-serve-static-core" {
  interface Request {
    user?: AccessTokenPayload
  }
}
