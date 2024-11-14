import { RowDataPacket } from "mysql2";
import * as Yup from "yup";

export interface UserRow extends UserDB, RowDataPacket {}

export interface UserDB {
  // serve per castare le info che si trovano nel DB
  id: number;
  name: string;
  email: string;
  pwhash: string;
  created_at: string;
  updated_at: string;
  role: string;
}

export interface UserFE {
  // è il contenuto dell' access token che viene riconvertito in informazioni JSON
  id: number;
  name: string;
  email: string;
  role: string;
}

export function fromUserDBtoUserFE(userDB: UserDB): UserFE {
  const userFE: UserFE = {
    id: userDB.id,
    name: userDB.name,
    email: userDB.email,
    role: userDB.role
  };
  return userFE;
}

//--------------------- cose Legate all'Autenicazione ----------------------------

export interface SessionRow extends UserSessionDB, RowDataPacket {}

export interface AuthCookies {
  //i cookie che restituiamo all' autenticazione
  uuid: string;
  refreshToken: string;
}

export interface UserSessionDB {
  // sessioni di ogni utente per i vari dispositivi associati
  user_id: number;
  uuid: string;
  refreshToken: string;
}

export interface UserRequest {
  // interfaccia per la richiesta iniziale del Login o del Register
  name?: string;
  password: string;
  email: string;
  uuid: string;
}

export const userLoginRequestSchema = Yup.object({
  email: Yup.string().email().required("L'email è obbligatoria"),
  password: Yup.string()
    .min(8, "La password deve essere almeno di 8 caratteri")
    .required("La password è obbligatoria"),
  uuid: Yup.string().required("L'UUID è obbligatorio"),
  name: Yup.string().optional()
});

export const userRegisterRequestSchema = Yup.object({
  email: Yup.string().email().required("L'email è obbligatoria"),
  password: Yup.string()
    .min(8, "La password deve essere almeno di 8 caratteri")
    .required("La password è obbligatoria"),
  uuid: Yup.string().required("L'UUID è obbligatorio"),
  name: Yup.string()
    .min(3, "Il nome è troppo corto")
    .max(16, "Il nome è troppo lungo")
    .required("Il nome è obbligatorio"),
});

export interface AuthBodyReqRes {
  message?: string;
  accessToken: string;
}

export const authBodyReqResSchema = Yup.object({
  message: Yup.string(),
  accessToken: Yup.string().required("Manca l'accessToken")
});
