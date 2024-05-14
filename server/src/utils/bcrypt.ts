import bcrypt from "bcrypt";

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return new Promise<string>((resolve, reject) => {
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) throw reject(err);
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw reject(err);
        resolve(hash);
      });
    });
  });
};
export const decodePassword = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hashPassword, (err, decoded) => {
      if (err) throw reject(err);
      resolve(decoded);
    });
  });
};
