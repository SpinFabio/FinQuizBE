import { RowDataPacket } from "mysql2";
import * as Yup from "yup";

export interface UserRow extends UserDB, RowDataPacket {}

export interface UserDB { // serve per castare ile info che si trovano nel DB
  id: number;
  name: string;
  email: string;
  pwhash: string;
  created_at: string;
  updated_at: string;
  role: string;
}


export interface UserFE { // è il contenuto dell' access token che viene riconvertito in informazioni JSON
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface UserRequest {  // interfaccia per la richiesta iniziale del Login o del Register
  name?: string;
  password: string;
  email: string;
  uuid: string;
}

export const insertUserSchema = Yup.object({
  name: Yup.string().min(3).max(100).required(),
  email: Yup.string().email().required(),
  password: Yup.string().min(8).required()
});

export function fromUserDBtoUserFE(userDB: UserDB): UserFE {
  const userFE: UserFE = {
    id: userDB.id,
    name: userDB.name,
    email: userDB.email,
    role: userDB.role
  };

  return userFE;
}
