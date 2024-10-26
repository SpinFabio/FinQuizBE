import  express  from "express";
import {Pool} from 'mysql2/promise'
import { insertNewUser } from "../db/querys/user-insert-query";
import { loginUser } from "../db/querys/user-login-query";


export const cerateUserRouter = (myPool:Pool)=>{
  const router=express.Router();

  router
    .get('/',(_,res)=>{
      res.status(501).send('This feature is not yet implemented. Please check back in the future.');
    })
    .post('/',(req,res)=>{
      insertNewUser(myPool,req,res)
    })
    .post('/login',(req,res)=>{
      //console.log('ciao')
      loginUser(myPool,req,res)
    })

  return router
}