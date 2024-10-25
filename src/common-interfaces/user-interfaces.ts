import { RowDataPacket } from "mysql2";

export interface UserRow extends UserDB, RowDataPacket {}

export interface UserDB {
  id?: number;
  name: string;
  email: string;
  pwhash: string;
  salt: string;
  created_at?: string; 
  updated_at?: string; 
  role: string;
}

export interface InsertUserRequest{
  name: string;
  password: string;
  email: string
}
