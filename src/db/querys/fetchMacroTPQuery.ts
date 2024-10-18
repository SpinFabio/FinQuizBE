import { Request, Response } from 'express';
import { Pool, RowDataPacket } from 'mysql2/promise';
import {MacroTopicResponse,MacroTopicRequest, MacroTopicBase} from '../../common-interfaces/macro-topic-interfaces'
import { QuizBase,QuizDB } from "../../common-interfaces/quiz-interface";
import {quizDBToQuizFE} from './../utils-functions/quiz-convert'

export async function fetchMacroTPQuery(myPool: Pool, res?: Response) {
  try {
    const [testResults,_] = await myPool.query<RowDataPacket[]>(`
      SELECT * 
      FROM 
      `);
    //console.log(testResults); // ricordati di toglierlo quando finisci di debuggare

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

export async function fetchQuizMacroQuery(
  myPool: Pool, 
  req: Request, 
  res: Response
) {
  try {
    const macroTopicRequest = req.body as MacroTopicRequest;
    //console.log(macroTopicRequest);
  
    if (!macroTopicRequest || !macroTopicRequest.arrayMacrotopic) {
      return res.status(400).send('Bad request: Missing required fields');
    }
    
    const results: QuizDB[] = [];
    for (const macroTopic of macroTopicRequest.arrayMacrotopic) {
      const [rows] = await myPool.query<RowDataPacket[]>(`
        SELECT *
        FROM quiz
        WHERE macroTopicId = ?
        ORDER BY RAND()
        LIMIT ?;
      `, [macroTopic.macroID, macroTopic.quantitySelected]);  
      const quizzes = rows as QuizDB[];
      results.push(...quizzes); 
    }
    
    //console.log('result 1: ')
    //console.log(results);
    
    const resultsForFE: QuizBase[] = [];
    for (const quiz of results) {
      resultsForFE.push(quizDBToQuizFE(quiz)); // Usa la funzione di conversione
    }

    //console.log('result for frontend: ')
    //console.log(resultsForFE)
    console.log('query macro db finita')
    res.json({
      response: {
        message: 'Ecco qui il risultato della query',
        quizesArray: resultsForFE,  
      } as MacroTopicResponse,  
    });

  } catch (err) {
    console.error('Error: ', err);
    res.status(500).send('Internal server error');
  }
}
