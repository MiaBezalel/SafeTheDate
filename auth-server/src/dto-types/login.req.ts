import { Expose } from "class-transformer"
import { IsString } from "../utils/classValidator.utils"

export class LoginDTO {
  @IsString()
  @Expose()
  emailOrUsername: string

  // TODO: todo is password later on
  @IsString()
  @Expose()
  password: string
}
