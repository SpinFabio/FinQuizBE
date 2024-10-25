import { Pool } from "mysql2/promise";



export async function databaseHealtCheck(myPool: Pool) {
  try{
    await myPool.query('SELECT 1')
    console.log('Database connection successful');
  }catch(err){
    console.error('Database connection failed:', err);
    throw new Error('Database does not exist or connection failed');
  }
}