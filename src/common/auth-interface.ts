import { RowDataPacket } from "mysql2";
export interface SessionRow extends UserSessionDB, RowDataPacket {}


export interface AuthCookies { // 
  uuid: string;
  refreshToken: string;
}


export interface UserSessionDB { //
  user_id: number;
  uuid: string;
  refreshToken?: string;
}