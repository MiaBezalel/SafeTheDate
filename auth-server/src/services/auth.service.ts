import { ConsoleLogger, Events, ILogger } from "../utils/logger";
import {
  AccessTokenPayload,
  FormFieldError,
  HttpStatus,
  IToken,
} from "../utils/types";
import { FunctionalityError, serverErrorCodes } from "../utils/error";
import { RegisterDTO } from "../dto-types/register.req";
import RefreshToken, { IRefreshToken } from "../../mongo/models/RefreshToken";
import UserConfirmation, {
  IUserConfirmation,
} from "../../mongo/models/UserConfirmation";
import { compare, hash } from "bcrypt";
import { LoginDTO } from "src/dto-types/login.req";
import { TokensPack } from "src/dto-types/tokensPack";
import User, { IUser } from "../../mongo/models/User";
import { v4 } from "uuid";
import jwt from "jsonwebtoken";
import { MailSender } from "../utils/mail.utils";
import axios from "axios";

interface GoogleDto extends Omit<RegisterDTO, "password"> {
  isConfirmed: boolean;
}
class AuthService {
  private logger: ILogger;
  private refreshTokenTableIntegrator: typeof RefreshToken;
  private userTableIntegrator: typeof User;
  private userConfirmationTableIntegrator: typeof UserConfirmation;

  constructor(
    logger: ILogger,
    RefreshTokenTableIntegrator: typeof RefreshToken,
    userTableIntegrator: typeof User,
    userConfirmationTableIntegrator: typeof UserConfirmation
  ) {
    this.logger = logger;
    this.refreshTokenTableIntegrator = RefreshTokenTableIntegrator;
    this.userTableIntegrator = userTableIntegrator;
    this.userConfirmationTableIntegrator = userConfirmationTableIntegrator;
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
  async register(
    userToRegister: RegisterDTO
  ): Promise<FormFieldError<RegisterDTO>[]> {
    const errors: FormFieldError<RegisterDTO>[] = [];

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
    const userConfirmation = await this.userConfirmationTableIntegrator.create({
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
    return this.createTokensPack(token.user);
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

    return this.createTokensPack(user);
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
        return this.createTokensPack(dbUser);
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
        return this.createTokensPack(createdUser);
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
  private async createRefreshToken(user: IUser): Promise<IToken> {
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
      // TODO:  change error
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

  private async createTokensPack(user: IUser) {
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
  UserConfirmation
);
