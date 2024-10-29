import { Request, Response, NextFunction } from 'express';
import  jwt from 'jsonwebtoken'
import { UserDB } from '../common-interfaces/user-interfaces';


export function autenticateToken(
  req:Request,
  res:Response,
  next: NextFunction
){
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) {
    return res.sendStatus(401); 
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, user) => {
    if (err) {
      return res.sendStatus(403); 
    }
    req.user=user as UserDB
    next(); 
  });
}