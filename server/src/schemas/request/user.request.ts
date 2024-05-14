import { JwtPayload } from "jsonwebtoken";
import { TokenType, UserRole } from "~/constants/enum";

export interface RegisterReqBody {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: UserRole;
}
export interface LoginrReqBody {
  email: string;
  password: string;
}
export interface TokenPayLoad extends JwtPayload {
  id: string;
  tokenType: TokenType;
  exp: number;
  iat: number;
}
export interface LogoutReqBody {
  refresh_token: string;
}
export interface UpdateReqBody {
  name?: string;
  phone_number?: string;
  address?: string;
  company?: string;
}
export interface ForgotPasswordReqBody {
  email: string;
}
export interface VerifyForgotPasswordReqBody {
  forgot_password_token: string;
}
export interface ResetPasswordReqBody {
  forgot_password_token: string;
  password: string;
  confirmPassword: string;
}
