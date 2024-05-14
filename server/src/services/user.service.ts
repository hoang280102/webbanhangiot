import { TokenType } from "./../constants/enum";
import {
  LoginrReqBody,
  LogoutReqBody,
  RegisterReqBody,
  UpdateReqBody,
} from "~/schemas/request/user.request";
import { connectToDatabase } from "./database.service";
import { ResultSetHeader } from "mysql2/promise";
import { hashPassword } from "~/utils/bcrypt";
import { CustomResultSetHeader } from "~/schemas/models/user.model";
import { signToken } from "~/utils/token";

class UserService {
  signAcces = async (id: string) => {
    return signToken({
      payload: { id, tokenType: TokenType.AccessToken },
      secret: process.env.SECRET_ACCESS_KEY as string,
      options: {
        expiresIn: process.env.EXPIRES_IN_ACCESS_KEY as string,
      },
    });
  };
  signRefresh = async (id: string) => {
    return signToken({
      payload: { id, tokenType: TokenType.RefreshToken },
      secret: process.env.SECRET_REFRESH_KEY as string,
      options: {
        expiresIn: process.env.EXPIRES_IN_REFRESH_KEY as string,
      },
    });
  };
  signAccessAndRefresh = async (id: string) => {
    return await Promise.all([this.signAcces(id), this.signRefresh(id)]);
  };
  signForgotPassword = async (id: string) => {
    return signToken({
      payload: { id, tokenType: TokenType.ForgotPasswordToken },
      secret: process.env.SECRET_FORGOT_PASSWORD_KEY as string,
      options: {
        expiresIn: process.env.EXPIRES_IN_FORGOT_PASSWORD_KEY as string,
      },
    });
  };
  checkEmailExists = async (email: string) => {
    const db = await connectToDatabase();
    const query = "select * from user where email = (?)";
    const [user] = await db.query<ResultSetHeader>(query, [email]);
    const length = Object.keys(user).length;
    return Boolean(length);
  };
  register = async (payload: RegisterReqBody) => {
    const db = await connectToDatabase();
    const query = "insert into user (name,email,password) values(?,?,?)";
    const result = await db.execute<ResultSetHeader>(query, [
      payload.name,
      payload.email,
      await hashPassword(payload.password),
    ]);

    const id = result[0].insertId.toString();
    const [access_token, refresh_token] = await this.signAccessAndRefresh(id);
    await db.execute<ResultSetHeader>(
      "update user  set refresh_token =? where id =?",
      [refresh_token, id]
    );
    return { access_token, refresh_token };
  };
  checkEmail = async (email: string) => {
    const query = "select * from user where email = (?)";
    const db = await connectToDatabase();
    const [user] = await db.query<CustomResultSetHeader[]>(query, [email]);
    return user;
  };
  login = async (payload: LoginrReqBody) => {
    const db = await connectToDatabase();
    const query = "select * from user where email = (?)";
    const [user] = await db.query<CustomResultSetHeader[]>(query, [
      payload.email,
    ]);
    // console.log([user]);

    const { id } = user[0];
    const [access_token, refresh_token] = await this.signAccessAndRefresh(
      id.toString()
    );
    await db.execute<ResultSetHeader>(
      "update user set refresh_token =? where id =?",
      [refresh_token, id]
    );
    return { access_token, refresh_token };
  };
  logout = async (payload: LogoutReqBody) => {
    const db = await connectToDatabase();
    const query =
      "update user set refresh_token = NULL where  refresh_token = (?)";
    await db.query(query, [payload.refresh_token]);
    // console.log([user]);
    return true;
  };
  update = async (id: string, payload: UpdateReqBody) => {
    const db = await connectToDatabase();
    const query =
      "update user set name = (?), phone_number=(?),address=(?),company=(?) where id = (?)";
    await db.query(query, [
      payload.name,
      payload.phone_number,
      payload.address,
      payload.company,
      id,
    ]);
    return true;
  };
  forgotPassword = async (id: string) => {
    const db = await connectToDatabase();
    const query = "update user set forgot_password_token = (?) where id = (?)";
    const token = await this.signForgotPassword(id);
    await db.query(query, [token, id]);
    return true;
  };
  resetPassword = async (password: string, id: string) => {
    const db = await connectToDatabase();
    const query =
      "update user set password = (?),forgot_password_token = NULL  where id = (?)";
    const newPassword = await hashPassword(password);
    await db.query(query, [newPassword, id]);
    return true;
  };
}
const userService = new UserService();
export default userService;
