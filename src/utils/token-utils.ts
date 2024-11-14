import { UserFE } from "../common/user-interfaces";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export default function generateTokens(loggedUserFE: UserFE): {
  accessToken: string;
  refreshToken: string;
} {
  const accessToken = jwt.sign(loggedUserFE, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: process.env.AT_MAX_AGE
  });
  const refreshToken = jwt.sign(
    loggedUserFE,
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: process.env.RT_MAX_AGE
    }
  );

  return { accessToken, refreshToken };
}



