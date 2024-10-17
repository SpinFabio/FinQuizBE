import express from 'express';
import path from 'path';
import mysql from 'mysql2';
import { runTestQuery } from './db/querys/testQuery';
import {fetchQuizMacroQuery} from './db/querys/fetchMacroTPQuery'
import dotenv from 'dotenv'
dotenv.config();

const app=express();
const PORT=3000;


//---------------------- dichiarazione dei MIDDLEWARE -----------------------------------
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

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

/* async function runQuery() {
  try {
    const [testResult,testFields] = await myPool.query("SELECT * FROM macrotopic");
    console.log(testResult);
  } catch (err) {
    console.error('Error executing query:', err);
  }
} */

//runTestQuery(myPool)


//---------------------------------------------------------------------------------------



app.get('/',(_,res)=>{
  res.sendFile(path.join(__dirname,'htmlPages/index.html'))
})

app.get('/api/test',(_,res)=>{
  console.log('ricevuta una get dal client'); 
  res.json({ response: {
      'messaggio':'Ricevuto il messaggio dal client!',
      'contenuto':'prototipo del contenuto'
    }
  });
})

app.post('/api/test',(req,res)=>{
  console.log('sono stato contattato')
  //console.log(req.body);  
  fetchQuizMacroQuery(myPool,req,res); 
})

app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});