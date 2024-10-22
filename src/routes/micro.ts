
import {Pool} from 'mysql2/promise'
import express from 'express';
import rateLimit from 'express-rate-limit';
import { fetchQuizMicroQuery } from '../db/querys/fetch-micro-query';



export const cerateMicroRouter = (myPool: Pool)=>{
  const router= express.Router();

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
      fetchQuizMicroQuery(myPool,req,res)
    })

  return router
}