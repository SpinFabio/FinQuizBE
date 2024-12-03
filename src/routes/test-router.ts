import express from "express";
import { Pool } from "mysql2/promise";

export const createTestRouter = (myPool: Pool) => {
  const router = express.Router();

  router
    .route("/")
    .post((_, res) => {
      res.json({
        accessToken: "token di acessso fittizio",
        messaggio: "ecco qui la risposta alla test post ",
        content: "prototipo del contenuto"
      });
    })
    .get((_, res) => {
      res.json({
        response: {
          accessToken: "token di acessso fittizio",
          messaggio: "Ricevuto il messaggio dal client!",
          content: "prototipo del contenuto"
        }
      });
    });

  return router;
};
