import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { Request, Response } from "express";
import generateTokens from "../../utils/auth-token-utils";
import { UserFE, UserSessionDB } from "../../common/user-interfaces";
import { setResponseCookies, setSessionEntry } from "./user-utils";

export async function autoRefreshTokens(
  req: Request,
  res: Response,
  myPool: Pool
): Promise<void> {
    console.log(req.cookies);
    
    console.log("ciaone in 0");
    console.log(req.user);

    
    console.log("ciaone in 1");
    const userFE = {
      id: Number(req.user?.id),
      name: req.user?.name,
      role: req.user?.role,
      email: req.user?.email
    } as UserFE;

    const uuid = req.cookies?.uuid;
    const refreshToken = req.cookies?.refreshToken;
    const user_id = Number(req.user?.id);

    await isRefreshTokenAllowed(refreshToken, myPool);

    await checkSession(uuid, refreshToken, user_id, myPool);

    const tokens = generateTokens(userFE);
    await invalidateOldRefreshToken(refreshToken, myPool);

    const userSession: UserSessionDB = {
      uuid: uuid,
      user_id: userFE.id,
      refreshToken: tokens.refreshToken
    };
    await setSessionEntry(userSession, myPool);
    console.log(tokens);

    setResponseCookies(res, uuid, tokens.refreshToken);
    req.user = userFE as UserFE;

    return 
}

async function isRefreshTokenAllowed(
  refreshToken: string,
  myPool: Pool
): Promise<void> {
  const [blacklistedTokens] = await myPool.query<RowDataPacket[]>(
    `SELECT * FROM blacklisted_refresh_tokens WHERE token=?`,
    [refreshToken]
  );

  const [invalidTokens] = await myPool.query<RowDataPacket[]>(
    `SELECT * FROM invalid_refresh_tokens WHERE token=?`,
    [refreshToken]
  );

  if (blacklistedTokens.length > 0 || invalidTokens.length > 0) {
    throw new Error("Refresh token is invalid or blacklisted");
  }
}

async function checkSession(
  uuid: string,
  refreshToken: string,
  user_id: number,
  myPool: Pool
): Promise<void> {
  if (!user_id || !uuid || !refreshToken) {
    throw new Error("user_id, UUID, and refresh token are required");
  }

  const [rows] = await myPool.query<RowDataPacket[]>(
    `
    SELECT * 
    FROM user_sessions
    WHERE 
      uuid = ? AND
      refresh_token = ? AND
      user_id = ?
    `,
    [uuid, refreshToken, user_id]
  );

  if (rows.length === 0 || rows.length > 1) {
    throw new Error("Session not found or invalid");
  }
}

async function invalidateOldRefreshToken(
  oldRefreshToken: string,
  myPool: Pool
): Promise<void> {
  const [result] = await myPool.query<ResultSetHeader>(
    `
    INSERT INTO invalid_refresh_tokens (token)
    VALUES (?)
    `,
    [oldRefreshToken]
  );

  if (result.affectedRows <= 0) {
    throw new Error("Something went wrong in the refresh token invalidation");
  }
}
