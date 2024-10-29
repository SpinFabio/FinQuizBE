import { Request, Response } from 'express';
import { Pool,ResultSetHeader } from 'mysql2/promise';
import { UserDB, UserRequest, UserRow, insertUserSchema } from '../../common-interfaces/user-interfaces';
import bcrypt from 'bcrypt';
import * as Yup from 'yup';

export async function loginUser(
  myPool: Pool, 
  req: Request, 
  res: Response):Promise<UserDB | null> {
    
    try{
      const user = req.body as UserRequest
      await insertUserSchema.validate(user,{ abortEarly: false })
      
      const [rows] = await myPool.query<UserRow[]>(`
        SELECT * 
        FROM user
        WHERE email=?;
      `,[user.email])

      if(rows.length === 0){
        res.status(400).send('User not registered');
        return null
      }

      const isPasswordValid = await bcrypt.compare(user.password, rows[0].pwhash);
      if (isPasswordValid) {
        //res.status(200).send('Success');
        return rows[0] as UserDB
      } else {
        res.status(401).send('Invalid credentials');
        return null 
      }
      
      
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        res.status(400).json({ errors: err.errors });
        return null
      }
    console.error('Error: ', err);
    res.status(500).send('Internal server error');
  }
  return null
}


