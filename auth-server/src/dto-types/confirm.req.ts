import { Expose } from "class-transformer"
import { IsNotEmpty, IsString } from "../utils/classValidator.utils"

export class ConfirmDTO {
  @Expose()
  @IsNotEmpty()
  @IsString()
  confirmId: string
}
