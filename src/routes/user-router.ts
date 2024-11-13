import express from "express";
import dotenv from "dotenv";
import { Pool } from "mysql2/promise";
import insertNewUser from "../db/querys/user-register";
import { loginUser } from "../db/querys/user-login";
import { handleSessionRefresh } from "../db/querys/user-session";
import { verifyAccessToken, verifyAndRefreshTokens, verifyRefreshToken } from "../middlewares/authenticateToken-middleware";

dotenv.config();

export const cerateUserRouter = (myPool: Pool) => {
  const router = express.Router();

  router
    .get("/", (_, res) => {
      res
        .status(501)
        .send(
          "This feature is not yet implemented. Please check back in the future."
        );
    })
    .post("/register", async (req, res) => {
      await insertNewUser(myPool, req, res);
    })
    .post("/login", async (req, res) => {
      await loginUser(myPool, req, res);
    })
    .get("/refresh", verifyRefreshToken, async (req, res) => {
      await handleSessionRefresh(req, res, myPool);
    })
    .post("/verify", verifyAccessToken, (req, res) => {
      res.status(200).json({
        message: `l'utente ${req.user?.email} può utilizare il servizio`
      });
    })
    .post("/autoTokens",verifyAndRefreshTokens(myPool),(_, res)=>{
      res.status(200).json({
        message: `ciao sono auto tokens e tutto è andato bene`
      });
    })
    ;

  return router;
};
