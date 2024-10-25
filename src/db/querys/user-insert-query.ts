import { Request, Response } from 'express';
import { Pool,ResultSetHeader } from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { InsertUserRequest, UserRow, UserDB  } from '../../common-interfaces/user-interfaces';




export async function insertNewUser(
  myPool: Pool, 
  req: Request, 
  res: Response) {
    
  try{
    const newUser = req.body as InsertUserRequest
    const newUserIsOK= await newUserRequestCheck(newUser,myPool)
    
    
    if(!newUserIsOK){
      return res.status(400).send('user already registered');
    }
    
    const hashedPassword = await bcrypt.hash(newUser.password,10)
    const [result] = await myPool.query<ResultSetHeader>(`
      INSERT INTO ProgettoQuizDB.user (name, email, pwhash) 
      VALUES (?, ?, ?);  
    `,[newUser.name,newUser.email,hashedPassword])

    if(result.affectedRows>0){
      res.status(201).send("user Sucessfully registered")
    }else{
      res.status(500).send('Failed to register user');
    }
  } catch (err) {
    console.error('Error: ', err);
    res.status(500).send('Internal server error');
  }
}



async function newUserRequestCheck(
  newUser:InsertUserRequest,
  myPool: Pool,
):Promise<boolean>{
  
  const[rows] = await myPool.query<UserRow[]>(`
    SELECT * 
    FROM progettoquizdb.user
    WHERE email=?;
  `,[newUser.email])
  
  if(rows.length>0){
    return false
  }
  
  return true;
}
