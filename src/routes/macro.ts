import  express  from "express";
import {fetchQuizMacroQuery} from '../db/querys/fetchMacroTPQuery'
import {Pool} from 'mysql2/promise'

export const createMacroRouter= (myPool:Pool)=>{
  const router=express.Router();

  router.post('/',(req,res)=>{
    console.log('sono il router POST /api/macro')
    fetchQuizMacroQuery(myPool,req,res)
  })
  
  return router;
}
