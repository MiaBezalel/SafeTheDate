import { ErrorRequestHandler } from "express";
import { ValidationError } from "class-validator";
import {
  HttpStatus,
  PayloadValidationError,
  ServerError,
  ServerValidationsReturn,
} from "./types";
import { ILogger } from "./logger";
import appLogger from "../lib/app-logger";

export enum serverErrorCodes {
  UserIsMissing = 1001,
  MissingBearerToken,
  ExpiredAccessToken,
  InvalidAccessToken,
  UserPasswordIncorrect,
  UnauthorizedRole,
  ServiceUnavilable,
  InvalidJsonPayload,
  TypeNotExsist,
  NoSuchRefreshToken,
  NoSuchConfirmationKey,
  InvalidResetToken,
  UserNotExists,
  UserHasNoSuchOrder,
  TooManyRequests,
}

// For passing arguments to error message use &1 &2 and so on
// IMPORTANT: starting from 1!
// Order of given array to constructor of Functionality error should match
export const serverErrorsMessage: { [id in serverErrorCodes]: string } = {
  [serverErrorCodes.UserIsMissing]: "User is missing, re-connect",
  [serverErrorCodes.MissingBearerToken]:
    "Missing Bearer Token, token must be provided",
  [serverErrorCodes.UserPasswordIncorrect]: "שם המשתמש או הסיסמא שגויים",
  [serverErrorCodes.ExpiredAccessToken]:
    "Expired access token, ask for a new one",
  [serverErrorCodes.InvalidAccessToken]:
    "Access token is invalid, unauthorized to resource",
  [serverErrorCodes.UnauthorizedRole]:
    "User has no priviliges to resource(missing role)",
  [serverErrorCodes.ServiceUnavilable]:
    "Service is unavilable due to server error, try again later",
  [serverErrorCodes.InvalidJsonPayload]: "Invalid Json sent in body payload",
  [serverErrorCodes.TypeNotExsist]:
    "אחד השדות שסופק לא קיים במערכת, פנה למנהל מערכת לבירור",
  [serverErrorCodes.NoSuchRefreshToken]:
    "לא הצלחנו לחדש את חיבורך, אנא התחבר מחדש",
  [serverErrorCodes.NoSuchConfirmationKey]: "לא קיים קוד אישור כזה",
  [serverErrorCodes.InvalidResetToken]: "קוד איפוס שגוי",
  [serverErrorCodes.UserNotExists]: "מצטערים, לא מצאנו את החשבון שלך",
  [serverErrorCodes.UserHasNoSuchOrder]:
    "מצטערים, נראה שאין לך עוד מהשירות המבוקש, רכוש חדש או צור איתנו קשר במידה וחווית תקלה",

  [serverErrorCodes.TooManyRequests]:
    "Too many requests from this IP, please try again later.",
};

export const retServerError = (
  errCode: serverErrorCodes,
  customMessage?: string
): ServerError => ({
  functionalityError: {
    code: errCode,
    message: customMessage ?? serverErrorsMessage[errCode],
  },
});

const VALIDATION_DEFAULT_ERR_MESSAGE = "סופק ערך לא חוקי";

export function mapValidationErrors<T extends object>(
  errors: ValidationError[]
): ServerValidationsReturn<T> {
  const payloadErrors = {} as PayloadValidationError<T>;
  errors.forEach((e) => {
    if (e.constraints) {
      const errors: string[] = [];

      Object.values(e.constraints).forEach((c) => errors.push(c));
      payloadErrors[e.property as keyof T] = errors;
    } else {
      payloadErrors[e.property as keyof T] = [VALIDATION_DEFAULT_ERR_MESSAGE];
    }
  });
  return { fieldErrors: payloadErrors };
}

export class FunctionalityError extends Error {
  serverErrorCode: serverErrorCodes;
  httpErrorCode: number;
  argumentsArray: string[];
  errorRetToClient = () => retServerError(this.serverErrorCode, this.message);
  constructor(
    serverErrorCode: serverErrorCodes,
    argumentsArray?: string[],
    httpErrorCode: HttpStatus = HttpStatus.BAD_REQUEST
  ) {
    let message = serverErrorsMessage[serverErrorCode];
    argumentsArray?.forEach(
      (a, index) => (message = message.replace(`&${index + 1}`, a))
    );
    super(message);
    this.serverErrorCode = serverErrorCode;
    this.httpErrorCode = httpErrorCode;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, FunctionalityError.prototype);
  }
}

export const errorHandler: (logger?: ILogger) => ErrorRequestHandler =
  (logger: ILogger = appLogger()) =>
  (err, req, res, next) => {
    try {
      console.error(err.stack);
      logger.error(err);
      if (res.headersSent) return;

      if (err instanceof FunctionalityError) {
        res.status(err.httpErrorCode).send(err.errorRetToClient());
        // Error was on payload json parsing, ret to user good error indicating what the error was
      } else if (
        err instanceof SyntaxError &&
        // @ts-ignore
        err.status === HttpStatus.BAD_REQUEST &&
        "body" in err
      ) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .send(
            retServerError(
              serverErrorCodes.InvalidJsonPayload,
              (err as SyntaxError).message
            )
          );
      } else {
        // Track uncaught exception to appinsights and mark it as critical
        res
          .status(500)
          .send(retServerError(serverErrorCodes.ServiceUnavilable));
      }
      // In case an exception occured in the error handler :D
    } catch (e) {
      logger.error(e as Error);

      if (res.headersSent) return;
      res.status(500).send(retServerError(serverErrorCodes.ServiceUnavilable));
    }
  };
