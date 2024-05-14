import {
  ForgotPasswordReqBody,
  ResetPasswordReqBody,
  TokenPayLoad,
  VerifyForgotPasswordReqBody,
} from "./../schemas/request/user.request";
import { Request, Response } from "express";
import { httpStatus } from "~/constants/status";
import userService from "~/services/user.service";
import { ParamsDictionary } from "express-serve-static-core";
import {
  LoginrReqBody,
  LogoutReqBody,
  RegisterReqBody,
  UpdateReqBody,
} from "~/schemas/request/user.request";
import { userMessages } from "~/constants/message";
import { pick } from "lodash";
import { CustomResultSetHeader } from "~/schemas/models/user.model";
class UserController {
  register = async (
    req: Request<ParamsDictionary, any, RegisterReqBody>,
    res: Response
  ) => {
    const result = await userService.register(req.body);
    res
      .status(httpStatus.CREATED)
      .json({ message: userMessages.CREATED_USER, result });
  };
  login = async (
    req: Request<ParamsDictionary, any, LoginrReqBody>,
    res: Response
  ) => {
    const result = await userService.login(req.body);
    res
      .status(httpStatus.OK)
      .json({ message: userMessages.LOGIN_SUCCESS, result });
  };
  logout = async (
    req: Request<ParamsDictionary, any, LogoutReqBody>,
    res: Response
  ) => {
    const result = await userService.logout(req.body);
    res
      .status(httpStatus.NO_CONTENT)
      .json({ message: userMessages.LOGOUT_SUCCESS, result });
  };
  update_user = async (
    req: Request<ParamsDictionary, any, UpdateReqBody>,
    res: Response
  ) => {
    const { id } = req.decoded_authorization as TokenPayLoad;
    const body = pick(req.body, ["name", "phone_number", "address", "company"]);
    const result = await userService.update(id, body);
    // console.log(result);
    res
      .status(httpStatus.OK)
      .json({ message: userMessages.UPDATE_INFOR_SUCCESS, result });
  };
  forgot_password = async (
    req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
    res: Response
  ) => {
    const [user] = req.user as CustomResultSetHeader[];
    const { id } = user;
    console.log(id);
    const result = await userService.forgotPassword(id);
    res
      .status(httpStatus.OK)
      .json({ message: userMessages.FORGOT_PASSWORD_SUCCESS, result });
  };
  verify_forgot_password = async (
    req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>,
    res: Response
  ) => {
    res
      .status(httpStatus.OK)
      .json({ message: userMessages.VERIFY_FORGOT_PASSWORD_SUCCESS });
  };
  reset_password = async (
    req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
    res: Response
  ) => {
    const { id } = req.decoded_forgot_password as TokenPayLoad;
    const result = await userService.resetPassword(req.body.password, id);
    res
      .status(httpStatus.OK)
      .json({ message: userMessages.RESET_PASSWORD_SUCCESS, result });
  };
}
const userController = new UserController();
export default userController;
