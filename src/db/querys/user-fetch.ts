import { Request, Response } from 'express';
import { Pool, RowDataPacket } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();
export async function fetchAllUser(
  myPool: Pool, 
  req: Request, 
  res: Response) {
    
  try{
    

  } catch (err) {
    console.error('Error: ', err);
    res.status(500).send('Internal server error');
  }
}


