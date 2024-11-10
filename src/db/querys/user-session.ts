import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { Request, Response } from "express";
import generateTokens from "../../utils/auth-token-utils";
import { UserFE } from "../../common/user-interfaces";
import { UserSessionDB } from "../../common/auth-interface";
import { setResponseCookies, setSessionEntry } from "./user-utils";

export async function handleSessionRefresh(
  req: Request,
  res: Response,
  myPool: Pool
): Promise<void> {
  try {
    console.log(req.cookies);
    console.log(req.user);

    const userFE = {
      id:Number(req.user?.id),
      name:req.user?.name,
      role:req.user?.role,
      email:req.user?.email
    } as UserFE;
    const uuid = req.cookies?.uuid;
    const refreshToken = req.cookies?.refreshToken;
    const user_id = Number(req.user?.id);

    const isRefreshOkay = await isRefreshTokenAllowed(refreshToken, myPool);
    if (!isRefreshOkay) {
      res
        .status(401)
        .send("Refresh is Invalid or Blacklisted you need to login again");
      return;
    }
    console.log("ciao1");

    const isSessionOk = await checkSession(uuid, refreshToken, user_id, myPool);
    if (!isSessionOk) {
      res.status(401).send("Session not found you need to login again");
      return;
    }

    console.log("ciao2");

    const tokens = generateTokens(userFE);
    await invalidateOldRefreshToken(refreshToken, myPool); // qui non c'è bisogno dell' await

    console.log("ciao3");



    const userSession: UserSessionDB = {
      uuid: uuid,
      user_id: userFE.id,
      refreshToken: tokens.refreshToken
    };
    setSessionEntry(userSession, myPool);
    console.log(tokens)
    
    setResponseCookies(res,uuid,tokens.refreshToken)
    res.status(200).json({
      message: "Tokens refresh succesfull!",
      accessToken: tokens.accessToken
    })


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
    `
      SELECT *
      FROM blacklisted_refresh_tokens
      WHERE token=?
    `,
    [refreshToken]
  );
  if (!invalidRows || invalidRows.length > 0) {
    return false;
  }

  [invalidRows] = await myPool.query<RowDataPacket[]>(
    `
      SELECT *
      FROM invalid_refresh_tokens
      WHERE token=?
    `,
    [refreshToken]
  );

  if (!invalidRows || invalidRows.length > 0) {
    return false;
  }

  return true;
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

  return rows.length >= 1;
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
