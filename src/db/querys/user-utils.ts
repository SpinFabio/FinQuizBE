import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import {
  SessionRow,
  UserRow,
  UserSessionDB
} from "../../common/user-interfaces";
import { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

export async function getUserByEmail(
  email: string,
  myPool: Pool
): Promise<UserRow[]> {
  const [rows] = await myPool.query<UserRow[]>(
    `
      SELECT * 
      FROM user
      WHERE email=?;
    `,
    [email]
  );

  return rows;
}

export async function getSessionEntry(
  user_id: number,
  myPool: Pool
): Promise<SessionRow[]> {
  if (!user_id) {
    throw new Error("user_id is required");
  }

  const [rows] = await myPool.query<SessionRow[]>(
    `
    SELECT *
    FROM user_sessions
    WHERE user_id=?
    `,
    [user_id]
  );
  return rows;
}

export async function setSessionEntry(
  userSession: UserSessionDB,
  myPool: Pool
): Promise<ResultSetHeader> {
  const { user_id, uuid, refreshToken } = userSession;

  if (!user_id || !uuid || !refreshToken) {
    throw new Error("user_id, UUID and  refresh token are required");
  }
  const [rows] = await myPool.query<ResultSetHeader>(
    `INSERT INTO user_sessions (user_id, uuid, refresh_token)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      user_id= VALUES(user_id),
      refresh_token = VALUES(refresh_token)`,
    [user_id, uuid, refreshToken]
  );
  

  return rows;
}

export function setResponseCookies(
  res: Response,
  uuid: string,
  refreshToken: string
) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: Number(process.env.COOKIE_MAX_AGE_MS!)
  });
  res.cookie("uuid", uuid, {
    httpOnly: true,
    maxAge: Number(process.env.COOKIE_MAX_AGE_MS!)
  });
}
