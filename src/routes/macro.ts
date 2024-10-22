import  express  from "express";
import {fetchQuizMacroQuery} from '../db/querys/fetch-macro-query'
import {Pool} from 'mysql2/promise'
import rateLimit from 'express-rate-limit';



export const createMacroRouter= (myPool:Pool)=>{
  const router=express.Router();

  //----------------------- Middleware -------------------------------------------------------------
  
  router
    .use(rateLimit({
      windowMs: 60 * 1000,
      max: 20,  
      message: 'Troppe richieste, riprova tra qualche secondo.',
      standardHeaders: true,
      legacyHeaders: false,
    }))

  //-----------------------------------------------------------------------------------------------



  router.post('/',(req,res)=>{
    //console.log('sono il router POST /api/macro')
    fetchQuizMacroQuery(myPool,req,res)
  })
  
  return router;
}
