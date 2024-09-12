import { Expose } from "class-transformer"
import { IsString, IsEmail } from "../utils/classValidator.utils"

//TODO: add name dto decorator
export class RegisterDTO {
  @IsEmail()
  @Expose()
  email: string

  @IsString()
  @Expose()
  username: string

  @IsString()
  @Expose()
  firstName: string

  @IsString()
  @Expose()
  lastName: string

  // TODO: todo is password later on
  @IsString()
  @Expose()
  password: string
}
