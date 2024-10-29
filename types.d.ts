import { Request } from 'express';
import { UserDB } from './src/common-interfaces/user-interfaces';

declare global {
  namespace Express {
    interface Request {
      user?: UserDB;  
    }
  }
}