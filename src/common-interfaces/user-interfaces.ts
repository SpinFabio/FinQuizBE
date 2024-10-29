import { RowDataPacket } from "mysql2";
import * as Yup from 'yup';

export interface UserRow extends UserDB, RowDataPacket {}

export interface UserDB {
  id?: number;
  name: string;
  email: string;
  pwhash: string;
  created_at?: string; 
  updated_at?: string; 
  role: string;
}

export interface UserFE{
  id?: number;
  name: string;
  email: string;
  role: string;
}

export interface UserRequest{
  name: string;
  password: string;
  email: string
}

export const insertUserSchema = Yup.object({
  name : Yup.string().min(3).max(100).required(),
  email: Yup.string().email().required(),
  password: Yup.string().min(8).required()
})


export function fromUserDBtoUserFE(userDB:UserDB):UserFE{
  const userFE:UserFE={
    id:userDB.id,
    name:userDB.name,
    email:userDB.email,
    role: userDB.role
  }
  
  return userFE
}