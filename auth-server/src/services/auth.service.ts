import { ConsoleLogger, Events, ILogger } from "../utils/logger";
import {
  AccessTokenPayload,
  FormFieldError,
  HttpStatus,
  IToken,
  TokenPayload,
} from "../utils/types";
import { FunctionalityError, serverErrorCodes } from "../utils/error";
import { RegisterDTO } from "../dto-types/register.req";
import RefreshToken, { IRefreshToken } from "../../mongo/models/RefreshToken";
import UserConfirmation, {
  IUserConfirmation,
} from "../../mongo/models/UserConfirmation";
import { compare, hash } from "bcrypt";
import { LoginDTO } from "../dto-types/login.req";
import { TokensPack } from "../dto-types/tokensPack";
import User, { IUser } from "../../mongo/models/User";
import { v4 } from "uuid";
import jwt from "jsonwebtoken";
import { MailSender } from "../utils/mail.utils";
import axios from "axios";
import { ResetPasswordTokenRequestDTO } from "../dto-types/resetPassToken.req";
import { generateOTP } from "../utils/otp.utils";
import UserRestoreToken, {
  IUserRestoreToken,
} from "../../mongo/models/UserRestoreToken";
import { maskString } from "../utils/string.utils";
import { ResetPasswordRequestDTO } from "../dto-types/resetPassword.req";

interface GoogleDto extends Omit<RegisterDTO, "password"> {
  isConfirmed: boolean;
}
class AuthService {
  private logger: ILogger;
  private refreshTokenTableIntegrator: typeof RefreshToken;
  private userTableIntegrator: typeof User;
  private userConfirmationTableIntegrator: typeof UserConfirmation;
  private userRestoreTokenTableIntegrator: typeof UserRestoreToken;

  constructor(
    logger: ILogger,
    RefreshTokenTableIntegrator: typeof RefreshToken,
    userTableIntegrator: typeof User,
    userConfirmationTableIntegrator: typeof UserConfirmation,
    userRestoreTokenTableIntegrator: typeof UserRestoreToken
  ) {
    this.logger = logger;
    this.refreshTokenTableIntegrator = RefreshTokenTableIntegrator;
    this.userTableIntegrator = userTableIntegrator;
    this.userConfirmationTableIntegrator = userConfirmationTableIntegrator;
    this.userRestoreTokenTableIntegrator = userRestoreTokenTableIntegrator;
  }
  private sendConfirmationMail(
    confirmationId: IUserConfirmation["_id"],
    registeredUserEmail: IUser["email"]
  ) {
    const id = confirmationId.valueOf();
    const url = `${process.env.FRONTEND_ENDPOINT}/user-confirmation?confirmation=${id}`;

    MailSender.getInstance()
      .sendMail({
        to: registeredUserEmail,
        from: process.env.SMTP_AUTH_USER,
        subject: "אישור הרשמה safe the date",
        text: url,
      })
      .then((r) =>
        this.logger.event(Events.CONFIRMATION_EMAIL_SENT, {
          email: registeredUserEmail,
        })
      )
      .catch(this.logger.error);
  }
  private getUserByUsernameOrEmail(usernameOrEmail: string) {
    return this.userTableIntegrator
      .findOne({
        $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
      })
      .lean();
  }
  async sendRestoreToken(
    usernameOrEmail: ResetPasswordTokenRequestDTO["usernameOrMail"]
  ) {
    const user = await this.getUserByUsernameOrEmail(usernameOrEmail);

    if (!user) {
      throw new FunctionalityError(
        serverErrorCodes.UserNotExists,
        [],
        HttpStatus.FORBIDDEN
      );
    }

    const now = new Date();
    const expiryDate = new Date(
      now.setMinutes(
        now.getMinutes() + +(process.env.RESET_PASSWORD_TOKEN_EXPIRATION ?? 0)
      )
    );

    const otpToken = generateOTP();

    const restoreToken = await this.userRestoreTokenTableIntegrator.updateOne(
      {
        user: user._id,
      },
      {
        $set: {
          expiryDate,
          token: otpToken,
          user: { _id: user._id },
        },
      },
      { upsert: true }
    );

    if (!restoreToken) {
      throw new Error("DB Error: could not upsert restore token");
    }

    this.sendResetPasswordTokenMail(
      { expiryDate: expiryDate, token: otpToken },
      user.email
    );

    return this.maskEmail(user.email);
  }

  private maskEmail(email: IUser["email"]) {
    const emailSuffix = email.substring(email.indexOf("."));
    return maskString(email, "*", ["@", emailSuffix]);
  }

  private sendResetPasswordTokenMail(
    restoreToken: Pick<IUserRestoreToken, "expiryDate" | "token">,
    email: IUser["email"]
  ) {
    MailSender.getInstance()
      .sendMail({
        to: email,
        from: process.env.SMTP_AUTH_USER,
        subject: "איפוס סיסמא safethedate בקלות",
        text: restoreToken.token,
      })
      .then((r) =>
        this.logger.event(Events.CONFIRMATION_EMAIL_SENT, {
          email,
        })
      )
      .catch(this.logger.error);
  }

  async resetPassword(newPassword: ResetPasswordRequestDTO) {
    const token = await this.userRestoreTokenTableIntegrator.findOne({
      token: newPassword.token,
    });

    if (!token) {
      throw new FunctionalityError(
        serverErrorCodes.InvalidResetToken,
        [],
        HttpStatus.FORBIDDEN
      );
    }
    await this.userTableIntegrator.updateOne(
      { _id: token.user._id },
      { password: await this.hashPassword(newPassword.password) }
    );

    // After password change, invalidate refresh token of user so all connected users must enter credentials
    // again when access token will expire
    await this.logout(token.user._id);

    // Also delete the reset token, operation ended and cannot be re-done with same token
    return this.deleteToken(token.user._id).catch((e) => this.logger.error(e));
  }

  private hashPassword(password: string) {
    return hash(password, +(process.env.PASSWORD_HASH_SALTS ?? 8));
  }

  private deleteToken(userId: IUser["_id"]) {
    return this.userRestoreTokenTableIntegrator.deleteMany({
      where: {
        userId: userId,
      },
    });
  }

  async register(
    userToRegister: RegisterDTO
  ): Promise<FormFieldError<RegisterDTO>[]> {
    const errors: FormFieldError<RegisterDTO>[] = [];
    try {
      // Check if email or username already exists
      const dbUser = await this.userTableIntegrator
        .findOne({
          $or: [
            { email: userToRegister.email },
            { username: userToRegister.username },
          ],
        })
        .lean();
      if (dbUser) {
        if (dbUser.email === userToRegister.email) {
          errors.push({
            fieldName: "email",
            message: "Email address already in use, please try another",
          });
        }
        if (dbUser.username === userToRegister.username) {
          errors.push({
            fieldName: "username",
            message: "Username already in use, please try another",
          });
        }
      }

      if (errors.length > 0) {
        return errors;
      }

      // All good, create the user
      let createdUser: any = null;
      const userConfirmation =
        await this.userConfirmationTableIntegrator.create({
          email: userToRegister.email,
        });
      if (userConfirmation) {
        createdUser = await this.userTableIntegrator.create({
          email: userToRegister.email,
          firstName: userToRegister.firstName,
          lastName: userToRegister.lastName,
          password: await hash(
            userToRegister.password,
            +(process.env.PASSWORD_HASH_SALTS ?? 8)
          ),
          username: userToRegister.username,
          userConfirmation: userConfirmation._id.valueOf(),
        });
        this.sendConfirmationMail(
          createdUser?.userConfirmation?._id!,
          createdUser?.email
        );
      }

      if (!createdUser) {
        throw new FunctionalityError(serverErrorCodes.ServiceUnavilable);
      }

      return [];
    } catch (error) {
      console.log(error);
      throw new FunctionalityError(serverErrorCodes.ServiceUnavilable);
    }
  }

  private verifyTokenExpiration(token: IToken) {
    return token.expiryDate.getTime() > new Date().getTime();
  }

  async regenerateAccessToken(refreshToken: string): Promise<TokensPack> {
    const token = await this.refreshTokenTableIntegrator
      .findOne({
        token: refreshToken,
      })
      .populate("user")
      .lean();

    if (!token || !this.verifyTokenExpiration(token as IToken)) {
      throw new FunctionalityError(serverErrorCodes.NoSuchRefreshToken);
    }
    let {image, ...userWithoutImage} = token.user;

    return this.createTokensPack(userWithoutImage);
  }
  async confirmUser(confirmationId: IUserConfirmation["_id"]) {
    const user = await this.userConfirmationTableIntegrator
      .findOne({
        _id: confirmationId,
      })
      .lean();
    if (!user) {
      throw new FunctionalityError(serverErrorCodes.UserIsMissing);
    }
    const updUser = await this.userTableIntegrator.updateOne(
      {
        email: user.email,
      },
      { $set: { isConfirmed: true } }
    );

    if (!updUser)
      throw new FunctionalityError(serverErrorCodes.ServiceUnavilable);

    return updUser;
  }
  async login({ emailOrUsername, password }: LoginDTO): Promise<TokensPack> {
    // Try selecting either by email or username
    const user: IUser | null = await this.userTableIntegrator
      .findOne({
        $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
      })
      .lean();

    // No such user with given email or username
    if (!user) {
      throw new FunctionalityError(
        serverErrorCodes.UserPasswordIncorrect,
        [],
        HttpStatus.FORBIDDEN
      );
    }

    if (!(await compare(password, user.password))) {
      throw new FunctionalityError(
        serverErrorCodes.UserPasswordIncorrect,
        [],
        HttpStatus.FORBIDDEN
      );
    }

    let {image, ...userWithoutImage} = user;

    return this.createTokensPack(userWithoutImage);
  }
  async loginRegisterWithGoogle({
    accessToken,
  }: {
    accessToken: string;
  }): Promise<TokensPack> {
    try {
      console.log("accessToken");
      console.log(accessToken);
      // Send a request to Google API to validate the access token
      const { data } = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`
      );
      const userToRegister: GoogleDto = {
        email: data.email,
        username: data.name,
        firstName: data.given_name,
        lastName: data.family_name,
        isConfirmed: data.verified_email,
      };
      console.log(userToRegister);
      // Check if email or username already exists
      const dbUser = await this.userTableIntegrator
        .findOne({
          $or: [
            { email: userToRegister.email },
            { username: userToRegister.username },
          ],
        })
        .lean();
      if (dbUser) {
        // we need to login
        let {image, ...userWithoutImage} = dbUser;

        return this.createTokensPack(userWithoutImage);
      } else {
        // we need to register
        let createdUser: any = null;
        let userConfirmation = null;
        if (!userToRegister.isConfirmed) {
          userConfirmation = await this.userConfirmationTableIntegrator.create({
            email: userToRegister.email,
          });
          createdUser = await this.userTableIntegrator.create({
            email: userToRegister.email,
            firstName: userToRegister.firstName,
            lastName: userToRegister.lastName,
            username: userToRegister.username,
            isConfirmed: userToRegister.isConfirmed,
            userConfirmation: userConfirmation._id.valueOf(),
          });
        } else {
          createdUser = await this.userTableIntegrator.create({
            email: userToRegister.email,
            firstName: userToRegister.firstName,
            lastName: userToRegister.lastName,
            username: userToRegister.username,
            isConfirmed: userToRegister.isConfirmed,
          });
        }
        if (userConfirmation) {
          this.sendConfirmationMail(
            createdUser?.userConfirmation?._id!,
            createdUser?.email
          );
        }
        console.log(createdUser);

        if (!createdUser) {
          throw new FunctionalityError(serverErrorCodes.ServiceUnavilable);
        }
        let {image, ...userWithoutImage} = createdUser;

        return this.createTokensPack(userWithoutImage);
      }
    } catch (error) {
      throw new FunctionalityError(
        serverErrorCodes.InvalidAccessToken,
        [],
        HttpStatus.FORBIDDEN
      );
    }
  }
  private generateRefreshToken(): IToken {
    const REFRESH_TOKEN_EXPIRATION = +(
      process.env.REFRESH_TOKEN_EXPIRATION ?? 0
    );

    let expiredAt = new Date();
    expiredAt.setSeconds(expiredAt.getSeconds() + REFRESH_TOKEN_EXPIRATION);

    const token = v4();

    return { expiryDate: expiredAt, token };
  }
  private async createRefreshToken(user: TokenPayload): Promise<IToken> {
    const token = this.generateRefreshToken();
    console.log(user._id.valueOf());
    console.log(user);
    const result = await this.refreshTokenTableIntegrator.updateOne(
      {
        user: user._id,
      },
      {
        $set: {
          expiryDate: token.expiryDate,
          token: token.token,
          user: { _id: user._id },
        },
      },
      { upsert: true }
    );

    if (!result) {
      throw new FunctionalityError(serverErrorCodes.ServiceUnavilable);
    }

    return token;
  }
  private createAccessToken(tokenPayload: AccessTokenPayload): Promise<string> {
    return new Promise((resolve, reject) => {
      const JWT_SECRET = process.env.JWT_SECRET ?? "";
      const JWT_EXPIRATION = +(process.env.JWT_EXPIRATION ?? 0);

      jwt.sign(
        tokenPayload,
        JWT_SECRET,
        {
          expiresIn: JWT_EXPIRATION,
          audience: process.env.JWT_AUDIENCE,
          issuer: process.env.JWT_ISSUER ?? "",
        },
        (err, encoded) => {
          if (err || !encoded) {
            this.logger.error(
              err ?? new Error("sign method did not provide token")
            );
            return reject(err);
          }
          resolve(encoded!);
        }
      );
    });
  }

  logout(userId: IUser["_id"]) {
    return this.refreshTokenTableIntegrator.deleteMany({
      user: userId,
    });
  }

  private async createTokensPack(user: TokenPayload) {
    const { password, ...tokenPayload } = user;
    const refreshToken = await this.createRefreshToken(user);
    const accessToken = await this.createAccessToken(tokenPayload);
    return {
      accessToken: accessToken,
      expiresIn: +(process.env.JWT_EXPIRATION ?? 0),
      refreshExpiryDate: refreshToken.expiryDate,
      refreshToken: refreshToken.token,
    };
  }
}
export const authService = new AuthService(
  ConsoleLogger.getInstance(),
  RefreshToken,
  User,
  UserConfirmation,
  UserRestoreToken
);
