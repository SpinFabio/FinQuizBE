import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthBodyReqRes, AuthCookies, UserFE } from "../common/user-interfaces";
import { Pool } from "mysql2/promise";

export function verifyAccessToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const body = req.body as AuthBodyReqRes;
  const accessToken = body.accessToken;

  if (!accessToken) {
    return res.status(401).json({ message: "You are not authenticated" });
  }

  jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET!,
    (err, decodedUser) => {
      if (err) {
        return res
          .status(403)
          .json({ message: "Access token is invalid or expired" });
      }
      req.user = decodedUser as UserFE;
      next();
      return;
    }
  );
  return;
}

export function verifyRefreshToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const cookies = req.cookies as AuthCookies;

  if (!cookies?.refreshToken || !cookies?.uuid) {
    return res
      .status(401)
      .json({ message: "Missing refresh token or device ID" });
  }

  try {
    jwt.verify(
      cookies.refreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
      (err, decodedUser) => {
        if (err) {
          return res
            .status(403)
            .json({ message: "Invalid or expired refresh token" });
        }
        req.user = decodedUser as UserFE;
        next();
        return;
      }
    );
    return true;
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error during token verification" });
  }
}
export function verifyAndRefreshTokens(myPool: Pool) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const body = req.body as AuthBodyReqRes;
    const accessToken = body.accessToken;
    const cookies = req.cookies as AuthCookies;

    if (!accessToken) {
      return res.status(401).json({ message: "You are not authenticated" });
    }
    if (!cookies?.refreshToken || !cookies?.uuid) {
      return res
        .status(401)
        .json({ message: "Missing refresh token or device ID" });
    }

    try {
      // Verifica dell'Access Token
      try {
        req.user = jwt.verify(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET!
        ) as UserFE;
        console.log("AT andava bene");
        next();
        return;
      } catch (err) {
        console.log("problemi con AT, passando a RT");
      }

      // Verifica del Refresh Token se l'Access Token non è valido
      try {
        req.user = jwt.verify(
          cookies.refreshToken,
          process.env.REFRESH_TOKEN_SECRET!
        ) as UserFE;
        console.log("RT okay");
        next();
        return;
      } catch (err) {
        console.log("ne AT ne RT andavano bene");
        return res.status(401).json({ message: "Invalid tokens" });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal server error during token verification" });
    }
  };
}
