import  express  from "express";
import {fetchQuizMacroQuery} from '../db/querys/macro-fetch-query'
import {Pool} from 'mysql2/promise'
import rateLimit from 'express-rate-limit';



export const createMacroRouter = (myPool:Pool)=>{
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
    fetchQuizMacroQuery(myPool,req,res)
  })
  
  return router;
}
