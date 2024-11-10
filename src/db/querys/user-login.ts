import { Request, Response } from "express";
import { Pool, ResultSetHeader } from "mysql2/promise";
import {
  UserDB,
  UserFE,
  UserRequest,
  UserRow,
  fromUserDBtoUserFE,
  insertUserSchema
} from "../../common/user-interfaces";
import bcrypt from "bcrypt";
import * as Yup from "yup";
import {
  getSessionEntry,
  getUserByEmail,
  setResponseCookies,
  setSessionEntry
} from "./user-utils";
import generateTokens from "../../utils/auth-token-utils";
import { SessionRow, UserSessionDB } from "../../common/auth-interface";
import dotenv from "dotenv";

dotenv.config();

export async function loginUser(
  myPool: Pool,
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.body as UserRequest;

    await insertUserSchema.validate(user, { abortEarly: false });

    const rows: UserRow[] = await getUserByEmail(user.email, myPool);

    if (!rows || rows.length === 0) {
      res.status(400).send("User not registered");
      return;
    }

    const userDB: UserDB = rows[0] as UserDB;
    const isPasswordValid = await bcrypt.compare(user.password, userDB.pwhash);

    if (!isPasswordValid) {
      res.status(401).send("Invalid credentials");
      return;
    }
    if (userDB.id == null) throw new Error("User ID is Undefined");
    if (user.uuid == null) {
      res.status(400).send("invalid uuid");
      return;
    }

    const userSession: UserSessionDB = {
      user_id: userDB.id,
      uuid: user.uuid
    };

    const isSessionOk = await checkDeviceAuth(userSession, myPool);
    if (!isSessionOk) {
      res.status(403).send("Max ammount of devices reached");
      return;
    }

    const loggedUserFE: UserFE = fromUserDBtoUserFE(userDB);
    const tokens = generateTokens(loggedUserFE);
    userSession.refreshToken = tokens.refreshToken;

    const result: ResultSetHeader = await setSessionEntry(userSession, myPool);

    if (result.affectedRows === 0) {
      res.status(500).send("Database operation failed: no rows were affected");
      return;
    }

    setResponseCookies(res,user.uuid,tokens.refreshToken)

    res.status(200).json({
      message: "Login Successful!",
      accessToken: tokens.accessToken
    });


  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      res.status(400).json({ errors: err.errors });
      return;
    }
    console.error("Error: ", err);
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

  if (!sessionArray || sessionArray.length == 0) {
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
