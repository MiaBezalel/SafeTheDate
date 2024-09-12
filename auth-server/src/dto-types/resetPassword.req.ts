import { Expose } from "class-transformer";
import { IsNotEmpty, IsString } from "../utils/classValidator.utils";
import { IUserRestoreToken } from "../../mongo/models/UserRestoreToken";

export class ResetPasswordRequestDTO {
  @IsString()
  @IsNotEmpty()
  @Expose()
  token: IUserRestoreToken["token"];

  @IsString()
  @Expose()
  password: string;
}
