import { Router } from "express";
import userController from "~/controllers/user.controller";
import {
  accessValidator,
  forgotPasswordValidator,
  loginMiddleware,
  refreshValidator,
  registerMiddleware,
  resetPasswordValidator,
  updateUserValidator,
  verifyForgotPasswordValidator,
} from "~/middleware/user.middleware";
import { wrapperHandlerError } from "~/utils/handleError";
const userRouter = Router();

userRouter.post(
  "/register",
  registerMiddleware,
  wrapperHandlerError(userController.register)
);
userRouter.post(
  "/login",
  loginMiddleware,
  wrapperHandlerError(userController.login)
);
userRouter.post(
  "/logout",
  accessValidator,
  refreshValidator,
  wrapperHandlerError(userController.logout)
);
userRouter.patch(
  "/update_info",
  accessValidator,
  updateUserValidator,
  wrapperHandlerError(userController.update_user)
);
userRouter.post(
  "/forgot_password",
  forgotPasswordValidator,
  wrapperHandlerError(userController.forgot_password)
);
userRouter.post(
  "/verify_forgot_password",
  verifyForgotPasswordValidator,
  wrapperHandlerError(userController.verify_forgot_password)
);
userRouter.post(
  "/reset_password",
  resetPasswordValidator,
  wrapperHandlerError(userController.reset_password)
);

export default userRouter;
