/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterDTO:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         username:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         password:
 *           type: string
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FormFieldError:
 *       type: object
 *       properties:
 *         fieldName:
 *           type: string
 *           description: The name of the form field with the error.
 *         message:
 *           type: string
 *           description: The error message associated with the form field.
 *
 *     ErrorResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/FormFieldError'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ResetPasswordTokenRequestDTO:
 *       type: object
 *       properties:
 *         usernameOrMail:
 *           type: string
 *           description: The username or email of the user requesting a password reset token.
 *           example: john.doe@example.com
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ResetPasswordRequestDTO:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: The password reset token.
 *           example: abcd1234
 *         password:
 *           type: string
 *           description: The new password.
 *           example: newPassword123
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GoogleLoginRequestDTO:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           description: The access token received from Google authentication.
 *           example: abcd1234
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginDTO:
 *       type: object
 *       properties:
 *         emailOrUsername:
 *           type: string
 *           description: The email or username of the user.
 *           example: john@example.com
 *         password:
 *           type: string
 *           description: The password.
 *           example: password123
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ConfirmDTO:
 *       type: object
 *       properties:
 *         confirmId:
 *           type: string
 *           description: The confirmation ID.
 *           example: abc123
 */
