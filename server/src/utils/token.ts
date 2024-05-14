import jwt, { SignOptions } from "jsonwebtoken";
import { TokenPayLoad } from "~/schemas/request/user.request";
export const signToken = ({
  payload,
  secret,
  options = {
    algorithm: "HS256",
  },
}: {
  payload: string | Buffer | object;
  secret: string;
  options: SignOptions;
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, secret, options, (err, result) => {
      if (err) reject(err);
      return resolve(result as string);
    });
  });
};
export const verifyToken = ({
  token,
  // secret_public_key = process.env.JWT_SECRET_KEY as string
  secret_public_key,
}: {
  token: string;
  secret_public_key: string;
}) => {
  return new Promise<TokenPayLoad>((resolve, reject) => {
    jwt.verify(token, secret_public_key, (err, decoded) => {
      if (err) throw reject(err);
      resolve(decoded as TokenPayLoad);
    });
  });
};
