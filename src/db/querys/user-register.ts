import {
  UserRequest,
  UserRow,
  insertUserSchema
} from "../../common/user-interfaces";
import { Pool, ResultSetHeader } from "mysql2/promise";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import * as Yup from "yup";

export default async function registerNewUser(
  myPool: Pool,
  req: Request,
  res: Response
) {
  try {
    const newUser = req.body as UserRequest;
    await insertUserSchema.validate(newUser, { abortEarly: false });

    const newUserIsOK = await newUserRequestCheck(newUser, myPool);
    if (!newUserIsOK) {
      return res.status(400).send("user already registered");
    }

    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    const [result] = await myPool.query<ResultSetHeader>(
      `
      INSERT INTO user (name, email, pwhash) 
      VALUES (?, ?, ?);  
    `,
      [newUser.name, newUser.email, hashedPassword]
    );

    if (result.affectedRows > 0) {
      res.status(201).send("User Sucessfully registered");
    } else {
      res.status(500).send("Failed to register user");
    }
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      return res.status(400).json({ errors: err.errors });
    }
    console.error("Error: ", err);
    res.status(500).send("Internal server error");
  }
}

async function newUserRequestCheck(
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
