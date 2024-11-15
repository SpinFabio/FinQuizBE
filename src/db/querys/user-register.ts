import {
  AuthBodyReqRes,
  UserFE,
  UserRequest,
  UserRow,
  UserSessionDB,
  fromUserDBtoUserFE,
  userRegisterRequestSchema
} from "../../common/user-interfaces";
import { Pool, ResultSetHeader } from "mysql2/promise";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import * as Yup from "yup";
import generateTokens from "../../utils/token-utils";
import { setResponseCookies, setSessionEntry } from "./user-utils";

export async function registerNewUser(
  myPool: Pool,
  req: Request,
  res: Response
) {
  try {
    const newUser = req.body as UserRequest;
    await userRegisterRequestSchema.validate(newUser, { abortEarly: false });

    const newUserIsOK = await checkUserRegistration(newUser, myPool);
    if (!newUserIsOK) {
      return res.status(409).json({"message":"User already registered"});
    }

    const userFE: UserFE = await insertNewUser(newUser, myPool);
    const tokens = generateTokens(userFE);

    const userSession: UserSessionDB = {
      uuid: newUser.uuid,
      user_id: userFE.id,
      refreshToken: tokens.refreshToken
    };
    await setSessionEntry(userSession, myPool);
    setResponseCookies(res, newUser.uuid, tokens.refreshToken);
    const responseObj: AuthBodyReqRes = {
      message: "User successsfully registered",
      accessToken: tokens.accessToken
    };
    res.status(200).json(responseObj);
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      return res.status(400).json({ errors: err.errors });
    }
    res.status(500).send("Internal server error");
  }
}

async function checkUserRegistration(
  newUser: UserRequest,
  myPool: Pool
): Promise<boolean> {
  const [rows] = await myPool.query<UserRow[]>(
    `
    SELECT * 
    FROM user
    WHERE email=?;
  `,
    [newUser.email]
  );

  if (rows.length > 0) {
    return false;
  }

  return true;
}

async function insertNewUser(
  newUser: UserRequest,
  myPool: Pool
): Promise<UserFE> {
  const hashedPassword = await bcrypt.hash(newUser.password, 10);
  const [resultHeader] = await myPool.query<ResultSetHeader>(
    `INSERT INTO user (name, email, pwhash) 
      VALUES (?, ?, ?);`,
    [newUser.name, newUser.email, hashedPassword]
  );

  if (resultHeader.affectedRows === 0) {
    throw new Error("Failed to register user");
  }
  resultHeader.insertId

  const [rows] = await myPool.query<UserRow[]>(
    `SELECT *
    FROM user
    WHERE email=?
    `,
    [newUser.email]
  );
  const userFE: UserFE = fromUserDBtoUserFE(rows[0]);
  return userFE;
}
