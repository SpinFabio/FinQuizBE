import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { Request, Response } from "express";
import generateTokens from "../../utils/token-utils";
import {
  AuthBodyReqRes,
  UserFE,
  UserSessionDB
} from "../../common/user-interfaces";
import { setResponseCookies, setSessionEntry } from "./user-utils";

export async function refreshSession(
  req: Request,
  res: Response,
  myPool: Pool
): Promise<void> {
  try {
    const userFE = {
      id: Number(req.user?.id),
      name: req.user?.name,
      role: req.user?.role,
      email: req.user?.email
    } as UserFE;
    const uuid = req.cookies?.uuid;
    const refreshToken = req.cookies?.refreshToken;
    const user_id = Number(req.user?.id);

    if (!uuid || !refreshToken || !userFE.id) {
      res.status(400).send("Missing required cookies or user data");
      return;
    }

    const isRefreshOkay = await isRefreshTokenAllowed(refreshToken, myPool);
    if (!isRefreshOkay) {
      res
        .status(401)
        .send("Refresh is Invalid or Blacklisted you need to login again");
      return;
    }

    //console.log(userFE);
    //console.log(req.cookies);

    const isSessionOk = await checkSession(uuid, refreshToken, user_id, myPool);

    if (!isSessionOk) {
      res.status(401).send("Session not found you need to login again");
      return;
    }

    const tokens = generateTokens(userFE);
    await invalidateOldRefreshToken(refreshToken, myPool);
    const userSession: UserSessionDB = {
      uuid: uuid,
      user_id: userFE.id,
      refreshToken: tokens.refreshToken
    };
    await setSessionEntry(userSession, myPool);
    setResponseCookies(res, uuid, tokens.refreshToken);
    const responseObj: AuthBodyReqRes = {
      message: "Tokens refresh successful!",
      accessToken: tokens.accessToken
    };
    res.status(200).json(responseObj);
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).send("Internal server error");
  }
}

async function isRefreshTokenAllowed(
  refreshToken: string,
  myPool: Pool
): Promise<boolean> {
  let [invalidRows] = await myPool.query<RowDataPacket[]>(
    `SELECT * FROM blacklisted_refresh_tokens WHERE token=?
    UNION
    SELECT * FROM invalid_refresh_tokens WHERE token=?`,
    [refreshToken, refreshToken]
  );

  return invalidRows.length === 0;
}

async function checkSession(
  uuid: string,
  refreshToken: string,
  user_id: number,
  myPool: Pool
): Promise<boolean> {
  if (!user_id || !uuid || !refreshToken) {
    throw new Error("user_id, UUID, and refresh token are required");
  }

  const [rows] = await myPool.query<RowDataPacket[]>(
    `SELECT *
    FROM user_sessions
    WHERE 
      uuid = ? AND
      refresh_token = ? AND
      user_id = ?`,
    [uuid, refreshToken, user_id]
  );
  return rows.length >= 1;
}

async function invalidateOldRefreshToken(
  oldRefreshToken: string,
  myPool: Pool
): Promise<void> {
  const [result] = await myPool.query<ResultSetHeader>(
    `INSERT INTO invalid_refresh_tokens (token)
    VALUES (?)`,
    [oldRefreshToken]
  );

  if (result.affectedRows <= 0) {
    throw new Error(
      `Failed to insert refresh token ${oldRefreshToken} into invalid_refresh_tokens`
    );
  }
}
