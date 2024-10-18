import { Request, Response } from 'express';
import { Pool, RowDataPacket } from 'mysql2/promise';
import {MacroTopicResponse,MacroTopicRequest, MacroTopicBase} from '../../common-interfaces/macro-topic-interfaces'
import { QuizBase,QuizDB } from "../../common-interfaces/quiz-interface";
import {quizDBToQuizFE} from './../utils-functions/quiz-convert'
import dotenv from 'dotenv';

dotenv.config()

const QUIZ_LIMIT= parseInt(process.env.QUIZ_LIMIT || '100')
const MACROTOPIC_LIMIT= parseInt(process.env.MACROTOPIC_LIMIT || '5')



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
      if (
        !Number.isInteger(macroTopic.macroID) || 
        macroTopic.macroID <= 0 || 
        macroTopic.macroID > MACROTOPIC_LIMIT
      ) {
        return res.status(400).send('Invalid macroTopic ID: The ID must be a positive integer within the allowed range.');
      }
      
      if (
        !Number.isInteger(macroTopic.quantitySelected) || 
        macroTopic.quantitySelected <= 0
      ) {
        return res.status(400).send('Invalid quantity selected: The quantity must be a positive integer greater than zero.');
      }
      
      
      const quantitySelected= Math.min(macroTopic.quantitySelected,QUIZ_LIMIT)
      const [rows] = await myPool.query<RowDataPacket[]>(`
        SELECT *
        FROM quiz
        WHERE macroTopicId = ?
        ORDER BY RAND()
        LIMIT ?;
      `, [macroTopic.macroID, quantitySelected]);  

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