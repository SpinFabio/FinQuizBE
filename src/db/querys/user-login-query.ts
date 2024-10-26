import { Request, Response } from 'express';
import { Pool,ResultSetHeader } from 'mysql2/promise';
import { UserRequest, UserRow, insertUserSchema } from '../../common-interfaces/user-interfaces';
import bcrypt from 'bcrypt';
import * as Yup from 'yup';

export async function loginUser(
  myPool: Pool, 
  req: Request, 
  res: Response) {
    
    try{
      const user = req.body as UserRequest
      await insertUserSchema.validate(user,{ abortEarly: false })
      
      const [rows] = await myPool.query<UserRow[]>(`
        SELECT * 
        FROM user
        WHERE email=?;
      `,[user.email])

      if(rows.length === 0){
        return res.status(400).send('User not registered');
      }

      const isPasswordValid = await bcrypt.compare(user.password, rows[0].pwhash);
      if (isPasswordValid) {
        return res.status(200).send('Success');
      } else {
        return res.status(401).send('Invalid credentials');
      }
      

    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        return res.status(400).json({ errors: err.errors });
      }
    console.error('Error: ', err);
    res.status(500).send('Internal server error');
  }
}


