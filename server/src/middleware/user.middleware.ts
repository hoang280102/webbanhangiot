import { checkSchema, ParamSchema } from "express-validator";
import { JsonWebTokenError } from "jsonwebtoken";
import { capitalize } from "lodash";
import { ResultSetHeader } from "mysql2/promise";
import { userMessages } from "~/constants/message";
import { httpStatus } from "~/constants/status";
import { ErrorWithStatus } from "~/schemas/models/error";
import { connectToDatabase } from "~/services/database.service";
import { Request } from "express";
import userService from "~/services/user.service";
import { decodePassword } from "~/utils/bcrypt";
import { verifyToken } from "~/utils/token";
import { validate } from "~/utils/validate";

const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: userMessages.NOT_EMPTY,
  },
  isString: {
    errorMessage: userMessages.IS_STRING,
  },
  trim: true,
  isStrongPassword: {
    errorMessage: userMessages.STRONG_PASSWORD,
  },
};
const confirmPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: userMessages.NOT_EMPTY,
  },
  isString: {
    errorMessage: userMessages.IS_STRING,
  },
  trim: true,
  isStrongPassword: {
    errorMessage: userMessages.STRONG_PASSWORD,
  },
  custom: {
    options: async (value, { req }) => {
      if (value !== req.body.password) {
        throw new ErrorWithStatus({
          message: userMessages.CONFIRM_PASSWORD_DIFFERENCE_PASSWORD,
          status: httpStatus.UNAUTHORIZED,
        });
      }
      return true;
    },
  },
};
const forgotPasswordTokenSchema: ParamSchema = {
  notEmpty: {
    errorMessage: userMessages.NOT_EMPTY,
  },
  isString: {
    errorMessage: userMessages.IS_STRING,
  },
  trim: true,
  custom: {
    options: async (value, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: userMessages.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
          status: httpStatus.UNAUTHORIZED,
        });
      }
      try {
        const decoded_forgot_password = await verifyToken({
          token: value,
          secret_public_key: process.env.SECRET_FORGOT_PASSWORD_KEY as string,
        });
        const { id } = decoded_forgot_password;
        // console.log(id);
        const db = await connectToDatabase();
        const user = await db.query("select * from user where id =(?)", id);
        if (!user) {
          throw new ErrorWithStatus({
            message: userMessages.USER_NOT_FOUND,
            status: httpStatus.UNAUTHORIZED,
          });
        }
        (req as Request).decoded_forgot_password = decoded_forgot_password;
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            message: capitalize(error.message),
            status: httpStatus.UNAUTHORIZED,
          });
        }
        throw error;
      }
      return true;
    },
  },
};

export const registerMiddleware = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: userMessages.NOT_EMPTY,
        },
        isString: {
          errorMessage: userMessages.IS_STRING,
        },
        isLength: {
          options: {
            min: 2,
            max: 30,
          },
          errorMessage: userMessages.NAME_IS_LENGTH,
        },
        trim: true,
      },
      email: {
        notEmpty: {
          errorMessage: userMessages.NOT_EMPTY,
        },
        isString: {
          errorMessage: userMessages.IS_STRING,
        },
        trim: true,
        isEmail: {
          errorMessage: userMessages.IS_EMAIL,
        },
        custom: {
          options: async (value, { req }) => {
            const result = await userService.checkEmailExists(value);
            // console.log(result)
            if (result) {
              throw new ErrorWithStatus({
                message: userMessages.EMAIL_EXIST,
                status: httpStatus.UNAUTHORIZED,
              });
            }
            return true;
          },
        },
      },
      password: passwordSchema,
      cofirmPassword: confirmPasswordSchema,
    },
    ["body"]
  )
);
export const loginMiddleware = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: userMessages.NOT_EMPTY,
        },
        isString: {
          errorMessage: userMessages.IS_STRING,
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await userService.checkEmail(value);
            if (!user) {
              throw new Error(userMessages.EMAIL_IS_NOT_FOUND);
            }
            const checkPassword = await decodePassword(
              req.body.password,
              user[0].password
            );

            if (!checkPassword) {
              throw new Error(userMessages.PASSWORD_NOT_VALID);
            }
            return true;
          },
        },
      },
      password: passwordSchema,
    },
    ["body"]
  )
);
export const accessValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            const access_token = value.split(" ")[1];
            if (!access_token)
              throw new ErrorWithStatus({
                message: userMessages.ACCESS_TOKEN_IS_REQUIRED,
                status: httpStatus.UNAUTHORIZED,
              });
            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secret_public_key: process.env.SECRET_ACCESS_KEY as string,
              });
              (req as Request).decoded_authorization = decoded_authorization;
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: httpStatus.UNAUTHORIZED,
              });
            }
            return true;
          },
        },
      },
    },
    ["headers"]
  )
);
export const refreshValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: {
          errorMessage: userMessages.REFRESH_TOKEN_IS_REQUIRED,
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: userMessages.REFRESH_TOKEN_IS_REQUIRED,
                status: httpStatus.UNAUTHORIZED,
              });
            }
            const db = await connectToDatabase();
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({
                  token: value,
                  secret_public_key: process.env.SECRET_REFRESH_KEY as string,
                }),
                await db.query<ResultSetHeader>(
                  "select refresh_token from user where refresh_token=(?)",
                  [value]
                ),
              ]);
              if (!refresh_token) {
                throw new ErrorWithStatus({
                  message: userMessages.REFRESH_TOKEN_IS_USED_OR_NOT_EXIST,
                  status: httpStatus.UNAUTHORIZED,
                });
              }
              console.log(decoded_refresh_token);
              (req as Request).decoded_refresh_token = decoded_refresh_token;
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: httpStatus.UNAUTHORIZED,
                });
              }
              throw error;
            }
            return true;
          },
        },
      },
    },
    ["body"]
  )
);
export const updateUserValidator = validate(
  checkSchema(
    {
      name: {
        isString: {
          errorMessage: userMessages.IS_STRING,
        },
        trim: true,
        isLength: {
          options: {
            min: 2,
            max: 30,
          },
        },
      },
      phone_number: {
        isString: {
          errorMessage: userMessages.IS_STRING,
        },
        isLength: {
          options: {
            min: 2,
            max: 30,
          },
          errorMessage: userMessages.NAME_IS_LENGTH,
        },
        trim: true,
      },
      address: {
        isString: {
          errorMessage: userMessages.IS_STRING,
        },
      },
      company: {
        isString: {
          errorMessage: userMessages.IS_STRING,
        },
      },
    },
    ["body"]
  )
);
export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: userMessages.NOT_EMPTY,
        },
        isString: {
          errorMessage: userMessages.IS_STRING,
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await userService.checkEmail(value);
            if (!user) {
              throw new Error(userMessages.EMAIL_IS_NOT_FOUND);
            }
            // console.log(user);
            (req as Request).user = user;
            // console.log((req as Request).user);
            return true;
          },
        },
      },
    },
    ["body"]
  )
);
export const verifyForgotPasswordValidator = validate(
  checkSchema(
    {
      forgot_password_token: forgotPasswordTokenSchema,
    },
    ["body"]
  )
);
export const resetPasswordValidator = validate(
  checkSchema(
    {
      forgot_password_token: forgotPasswordTokenSchema,
      password: passwordSchema,
      confirmPassword: confirmPasswordSchema,
    },
    ["body"]
  )
);
