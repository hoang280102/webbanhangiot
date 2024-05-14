import { Request } from "express";
import { TokenPayLoad } from "./schemas/request/user.request";
import { CustomResultSetHeader } from "~/schemas/models/user.model";
declare module "express-serve-static-core" {
  export interface Request {
    user?: CustomResultSetHeader[];
    decoded_authorization?: TokenPayLoad;
    decoded_refresh_token?: TokenPayLoad;
    decoded_forgot_password?: TokenPayLoad;
  }
}
