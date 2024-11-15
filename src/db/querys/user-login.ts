import { Request, Response } from "express";
import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import {
  AuthBodyReqRes,
  SessionRow,
  UserDB,
  UserFE,
  UserRequest,
  UserRow,
  UserSessionDB,
  fromUserDBtoUserFE,
  userLoginRequestSchema
} from "../../common/user-interfaces";
import bcrypt from "bcrypt";
import * as Yup from "yup";
import {
  getSessionEntry,
  getUserByEmail,
  setResponseCookies,
  setSessionEntry
} from "./user-utils";
import generateTokens from "../../utils/token-utils";

import dotenv from "dotenv";

dotenv.config();

export async function loginUser(
  myPool: Pool,
  req: Request,
  res: Response
): Promise<void> {
  try {

    //console.log(req.body)
    const userRequest = req.body as UserRequest;

    await userLoginRequestSchema.validate(userRequest, { abortEarly: false });

    const userRows: UserRow[] = await getUserByEmail(userRequest.email, myPool);
    if (!userRows || userRows.length === 0) {
      res.status(400).send("User not registered");
      return;
    }

    const userDB: UserDB = userRows[0] as UserDB;
    await checkPassword(userDB, res, userRequest);

    const userFE: UserFE = fromUserDBtoUserFE(userDB);

    const tokens = generateTokens(userFE);
    const userSession: UserSessionDB = {
      user_id: userDB.id,
      uuid: userRequest.uuid,
      refreshToken: tokens.refreshToken
    };

    const isSessionOk = await checkDeviceAuth(userSession, myPool);
    if (!isSessionOk) {
      res.status(403).send("Max ammount of devices reached");
      return;
    }

    const result: ResultSetHeader = await setSessionEntry(userSession, myPool);
    if(result.affectedRows===0){
      res.status(500).json({ message: "Failed to set session entry." });
      throw new Error("Failed to set session entry.")
    }
    setResponseCookies(res, userRequest.uuid, tokens.refreshToken);

    const responseBody: AuthBodyReqRes = {
      message: "Login Successful!",
      accessToken: tokens.accessToken
    };
    res.status(200).json(responseBody);
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      res.status(400).json({ errors: err.errors });
      return;
    }
    res.status(500).send("Internal server error");
  }
}

async function checkDeviceAuth(
  userSession: UserSessionDB,
  myPool: Pool
): Promise<boolean> {
  const sessionArray: SessionRow[] = await getSessionEntry(
    userSession.user_id,
    myPool
  );

  if (!sessionArray || sessionArray.length === 0) {
    return true;
  }

  if (sessionArray.length >= Number(process.env.MAX_DEVICES_PER_USER!)) {
    const isAlreadyInSession = sessionArray.find((session) => {
      return session.uuid === userSession.uuid;
    });
    if (!isAlreadyInSession) {
      return false;
    }
    return true;
  }

  return true;
}

async function checkPassword(
  userDB: UserDB,
  res: Response,
  userRequest: UserRequest
) {
  const isPasswordValid = await bcrypt.compare(
    userRequest.password,
    userDB.pwhash
  );
  if (!isPasswordValid) {
    res.status(401).send("Invalid password");
    throw new Error("Invalid password");
  }
  if (userRequest.uuid == null) {
    res.status(400).send("invalid uuid");
    throw new Error("uuid is invalid");
  }
}
