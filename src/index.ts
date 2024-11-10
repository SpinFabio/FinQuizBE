import express from "express";
import path from "path";
import mysql from "mysql2";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import errorHandler from "./middlewares/error-handler-middleware";
import {
  loggerMiddleware,
  loggerErrorMiddleware
} from "./middlewares/logger-middleware";
import envHealthChecker from "./utils/env-health-check";
import { createTestRouter } from "./routes/test-router";
import { createMacroRouter } from "./routes/macro-router";
import { cerateMicroRouter } from "./routes/micro-router";
import { cerateUserRouter } from "./routes/user-router";
import { databaseHealtCheck } from "./utils/database-health-check";
import cookieParser from 'cookie-parser';



dotenv.config();
envHealthChecker();
const app = express();
const PORT = process.env.PORT;

//---------------------- dichiarazione dei MIDDLEWARE -----------------------------------

app.use(
  cors({
    origin: process.env.FE_DOMAIN, // Indica l'origine del frontend
    methods: ["GET", "POST"], // Specifica i metodi consentiti
    credentials: true // Permette di inviare cookie o credenziali
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(loggerMiddleware);
app.use(loggerErrorMiddleware);
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: "too many request try later"
  })
);
app.use(express.static(path.join(__dirname, "public")));
app.use(errorHandler);

//---------------------------------------------------------------------------------------

//------------------------- DATABASE ----------------------------------------------------

const myPool = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASENAME,
    waitForConnections: true,
    connectionLimit: 10
  })
  .promise();

databaseHealtCheck(myPool).catch((err) => {
  console.error(err.message);
  process.exit(1);
});

//---------------------------------------------------------------------------------------

//------------------------- Routers ---- -------------------------------------------------

app.use("/api/test", createTestRouter(myPool));
app.use("/api/macro", createMacroRouter(myPool));
app.use("/api/micro", cerateMicroRouter(myPool));
app.use("/api/user", cerateUserRouter(myPool));

//---------------------------------------------------------------------------------------

app.all("*", (_, res) => {
  res.status(404).send("Route not found");
});
app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
  console.log(`Server client domain ${process.env.FE_DOMAIN}`);
});
