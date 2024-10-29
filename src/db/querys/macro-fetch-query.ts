import { Request, Response } from 'express';
import { Pool, RowDataPacket } from 'mysql2/promise';
import { MacroTopicRequest, macroTopicBaseSchema } from '../../common-interfaces/macro-topic-interfaces';
import { QuizBase,QuizDB } from "../../common-interfaces/quiz-interfaces";
import { quizDBToQuizFE } from '../../utils-functions/quiz-convert'
import dotenv from 'dotenv';
import * as Yup from 'yup';

dotenv.config();
const QUIZ_LIMIT = parseInt( process.env.QUIZ_LIMIT!)
const MACROTOPIC_ARRAY_LIMIT = parseInt(process.env.MACROTOPIC_ARRAY_LIMIT!)


export async function fetchQuizMacroQuery(
  myPool: Pool, 
  req: Request, 
  res: Response
){
  try {
    const macroTopicRequest = req.body as MacroTopicRequest;

    if(!macroTopicRequestCheck(macroTopicRequest)){
      return res.status(400).send('Bad request: Missing required fields');
    }

    const results: QuizDB[] = [];
    for (const macroTopic of macroTopicRequest.arrayMacrotopic) {
      
      await macroTopicBaseSchema.validate(macroTopic)
      if(!macroTopic.isChecked){
        continue;
      }
      const quantitySelected= Math.min(macroTopic.quantitySelected, QUIZ_LIMIT)
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
    
    
    const resultsForFE: QuizBase[] = [];
    for (const quiz of results) {
      resultsForFE.push(quizDBToQuizFE(quiz)); // Usa la funzione di conversione
    }

    console.log('query macro db finita')
    res.json({
        message: 'Ecco qui il risultato della query Macro',
        quizesArray: resultsForFE,  
    });

  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      return res.status(400).json({ errors: err.errors });
    }
    console.error('Error: ', err);
    res.status(500).send('Internal server error');
  }
}

function macroTopicRequestCheck(macroTopicRequest:MacroTopicRequest):boolean{
  if (!macroTopicRequest || !macroTopicRequest.arrayMacrotopic) {
    return false
  }
  if(macroTopicRequest.arrayMacrotopic.length>MACROTOPIC_ARRAY_LIMIT){
    return false
  }
  return true;
}




