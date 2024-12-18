import express from "express";
import dotenv from "dotenv";
import { Pool } from "mysql2/promise";
import { registerNewUser } from "../db/querys/user-register";
import { loginUser } from "../db/querys/user-login";
import { refreshSession } from "../db/querys/user-session";
import {
  verifyAccessToken,
  verifyRefreshToken
} from "../middlewares/authenticateToken-middleware";

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
      await registerNewUser(myPool, req, res);
    })
    .post("/login", async (req, res) => {
      await loginUser(myPool, req, res);
    })
    .get("/refresh", verifyRefreshToken, async (req, res) => {
      await refreshSession(req, res, myPool);
    })
    .post("/verify", verifyAccessToken, (req, res) => {
      res.status(200).json({
        message: `l'utente ${req.user?.email} può utilizare il servizio`
      });
    });

  return router;
};
