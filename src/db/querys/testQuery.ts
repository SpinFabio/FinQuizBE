import { Response } from 'express';
import { Pool, RowDataPacket } from 'mysql2/promise';

export async function runTestQuery(myPool: Pool, res?: Response) {
  try {
    const [testResults,_] = await myPool.query<RowDataPacket[]>("SELECT * FROM macrotopic");
    //console.log(testResults);

    if (res !== undefined) {
      res.json({
        response: {
          message: 'Ecco qui il risultato della query',
          data: testResults,
        },
      });
    }
  } catch (err) {
    console.error('Error executing test query:', err);
  }
}
