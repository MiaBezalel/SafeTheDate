import { Expose } from "class-transformer";
import { IsNotEmpty, IsString } from "../utils/classValidator.utils";
import { IUser } from "mongo/models/User";

export class ResetPasswordTokenRequestDTO {
  @IsString()
  @IsNotEmpty()
  @Expose()
  usernameOrMail: IUser["username"] | IUser["email"];
}
