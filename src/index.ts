import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import mysql from 'mysql2';
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit';

dotenv.config();

const app=express();
const PORT=3000;


//---------------------- dichiarazione dei MIDDLEWARE -----------------------------------
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: 'Something broke!', error: err.message });
});
app.use( // il limitatore di richieste globale
  rateLimit({
    windowMs: 60 * 1000, 
    max: 100,            
    message: 'Troppe richieste, riprova più tardi.',
  }))
//---------------------------------------------------------------------------------------

//------------------------- DATABASE ----------------------------------------------------
const myPool= mysql.createPool({
  host: process.env.DB_HOST,           // Assicurati di avere queste variabili nell'.env
  user: process.env.DB_USER,           
  password: process.env.DB_PASSWORD,   
  database: process.env.DB_DATABASENAME,
  waitForConnections: true,
  connectionLimit:10,
}).promise()

//---------------------------------------------------------------------------------------


//------------------------- Routers ------------------------------------------------------

import {createMacroRouter} from './routes/macro';
app.use('/api/macro', createMacroRouter(myPool));

import {createTestRouter} from './routes/test'
app.use('/api/test', createTestRouter(myPool))

//---------------------------------------------------------------------------------------


/* app.get('/',(_,res)=>{
  res.sendFile(path.join(__dirname,'htmlPages/index.html'))
})
 */

app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});