import express, { Response } from "express";
import { Types } from "mongoose";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from "../constants";
import { ConfirmDTO } from "../dto-types/confirm.req";
import { LoginDTO } from "../dto-types/login.req";
import { RegisterDTO } from "../dto-types/register.req";
import { TokensPack } from "../dto-types/tokensPack";
import { useAuth } from "../middlewares/AuthMiddelwares";
import { useValidateBodyDto } from "../middlewares/useValidation";
import { authService } from "../services/auth.service";
import { FunctionalityError, serverErrorCodes } from "../utils/error";
import { HttpStatus } from "../utils/types";
import { ResetPasswordTokenRequestDTO } from "../dto-types/resetPassToken.req";
import { ResetPasswordRequestDTO } from "../dto-types/resetPassword.req";
const rateLimit = require("express-rate-limit");

// Define the rate limit configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NUMBER_OF_REQUESTS, // Maximum of 5 requests per windowMs
  message: serverErrorCodes.TooManyRequests,
});

function configureTokensCookie(res: Response, tokens: TokensPack) {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, {
    httpOnly: true,
    path: "/api/auth/token",
    // domain: process.env.COOKIE_DOMAIN,
    expires: tokens.refreshExpiryDate,
    sameSite: "strict",
  });

  res.cookie(ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken, {
    httpOnly: true,
    // domain: process.env.COOKIE_DOMAIN,
    maxAge: tokens.expiresIn * 1000,
    sameSite: "strict",
  });
}

const router = express.Router();

/**
* @swagger
* tags:
* name: Auth
* description: The Authentication API
*/

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterDTO'
 *     responses:
 *       '201':
 *         description: User registered successfully
 *       '400':
 *         description: Service Unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/register", useValidateBodyDto(RegisterDTO), (req, res, next) => {
  authService
    .register(req.body as RegisterDTO)
    .then((errors) => {
      if (errors.length > 0) {
        res.status(HttpStatus.BAD_REQUEST).send(errors);
      } else {
        res.sendStatus(HttpStatus.CREATED);
      }
    })
    .catch(next);
});

/**
 * @swagger
 * /api/auth/reset/token:
 *   put:
 *     summary: Send a password reset token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordTokenRequestDTO'
 *     responses:
 *       '202':
 *         description: Token sent successfully
 *       '403':
 *         description: Forbidden - User does not exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '429':
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  "/reset/token",
  limiter,
  useValidateBodyDto(ResetPasswordTokenRequestDTO),
  (req, res, next) => {
    const usernameOrMail: ResetPasswordTokenRequestDTO = req.body;
    authService
      .sendRestoreToken(usernameOrMail.usernameOrMail)
      .then((maskedEmail) => res.status(HttpStatus.ACCEPTED).send(maskedEmail))
      .catch(next);
  }
);

/**
 * @swagger
 * /api/auth/reset:
 *   put:
 *     summary: Reset user password
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequestDTO'
 *     responses:
 *       '202':
 *         description: Password reset successful
 *       '403':
 *         description: Forbidden - Invalid reset token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '429':
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  "/reset",
  limiter,
  useValidateBodyDto(ResetPasswordRequestDTO),
  (req, res, next) => {
    authService
      .resetPassword(req.body as ResetPasswordRequestDTO)
      .then((_) => res.sendStatus(HttpStatus.ACCEPTED))
      .catch(next);
  }
);

/**
 * @swagger
 * /api/auth/google/login:
 *   post:
 *     summary: Login/Register with Google
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoogleLoginRequestDTO'
 *     responses:
 *       '200':
 *         description: Login/Register successful
 *       '403':
 *         description: Invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '429':
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/google/login", (req, res, next) => {
  authService
    .loginRegisterWithGoogle(req.body)
    .then((tokens) => {
      configureTokensCookie(res, tokens);
      res.sendStatus(HttpStatus.OK);
    })
    .catch(next);
});

/**
 * @swagger
 * /api/auth/token:
 *   post:
 *     summary: Regenerate access token
 *     tags:
 *       - Auth
 *     responses:
 *       '200':
 *         description: Access token regenerated successfully
 *       '403':
 *         description: Forbidden - No refresh token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/token", (req, res, next) => {
  try {
    const refreshToken = (req.cookies ?? {})[REFRESH_TOKEN_COOKIE_NAME];

    if (!refreshToken) {
      throw new FunctionalityError(
        serverErrorCodes.NoSuchRefreshToken,
        [],
        HttpStatus.FORBIDDEN
      );
    }

    authService
      .regenerateAccessToken(refreshToken)
      .then((tokens) => {
        configureTokensCookie(res, tokens);
        res.sendStatus(HttpStatus.OK);
      })
      .catch(next);
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginDTO'
 *     responses:
 *       '200':
 *         description: Login successful
 *       '403':
 *         description: Forbidden - User password incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '429':
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/login", useValidateBodyDto(LoginDTO), (req, res, next) => {
  authService
    .login(req.body)
    .then((tokens) => {
      configureTokensCookie(res, tokens);
      res.sendStatus(HttpStatus.OK);
    })
    .catch(next);
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User logout
 *     tags:
 *       - Auth
 *     responses:
 *       '202':
 *         description: Logout successful
 */
router.post("/logout", (req, res, next) => {
  if (!req.user?._id) {
    res.sendStatus(HttpStatus.ACCEPTED);
  } else {
    authService
      .logout(req.user!._id)
      .then((_) => {
        res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
        res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
        res.sendStatus(HttpStatus.ACCEPTED);
      })
      .catch(next);
  }
});

/**
 * @swagger
 * /api/auth/confirm:
 *   put:
 *     summary: Confirm user registration
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConfirmDTO'
 *     responses:
 *       '200':
 *         description: User registration confirmed
 *       '400':
 *         description: Service Unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/confirm", useValidateBodyDto(ConfirmDTO), (req, res, next) => {
  authService
    .confirmUser(new Types.ObjectId((req.body as ConfirmDTO).confirmId))
    .then((_) => res.sendStatus(HttpStatus.OK))
    .catch(next);
});

/**
 * @swagger
 * /api/auth/session:
 *   get:
 *     summary: Get user session
 *     tags:
 *       - Auth
 *     responses:
 *       '200':
 *         description: User session retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSession'
 */
router.get("/session", useAuth, (req, res, next) => {
  res.send(req.user);
});

export default router;
