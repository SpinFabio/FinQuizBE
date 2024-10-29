import express  from "express";
import dotenv from 'dotenv'
import {Pool} from 'mysql2/promise'
import { insertNewUser } from "../db/querys/user-insert-query";
import { loginUser } from "../db/querys/user-login-query";
import jwt from 'jsonwebtoken'
import { fromUserDBtoUserFE, UserDB, UserFE } from "../common-interfaces/user-interfaces";
import { autenticateToken } from "../middlewares/authenticateToken-middleware";

dotenv.config()


export const cerateUserRouter = (myPool:Pool)=>{
  const router=express.Router();

  router
    .get('/',(_,res)=>{
      res.status(501).send('This feature is not yet implemented. Please check back in the future.');
    })
    .post('/',async (req,res)=>{
      insertNewUser(myPool,req,res)
    })
    .post('/login',async (req,res)=>{
      const loggedUser: UserDB|null = await loginUser(myPool,req,res)
      if(loggedUser==null){
        return
      }

      const loggedUserFE:UserFE= fromUserDBtoUserFE(loggedUser)
      const accessToken=jwt.sign(loggedUserFE, process.env.ACCESS_TOKEN_SECRET!)
      
      res.status(200).json({
        message: 'Login Successful!',
        accessToken:accessToken,
      })

    })
    .post('/verify',autenticateToken,(req,res)=>{
      res.status(200).json(
        {
          message:`l'utente ${req.user?.name} può utilizare il servizio`,
        }
      )
    })

  return router
}