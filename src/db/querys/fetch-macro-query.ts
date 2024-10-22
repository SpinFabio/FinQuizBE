import { Request, Response } from 'express';
import { Pool, RowDataPacket } from 'mysql2/promise';
import { MacroTopicResponse, MacroTopicRequest, MacroTopicBase } from '../../common-interfaces/macro-topic-interfaces';
import { QuizBase,QuizDB } from "../../common-interfaces/quiz-interface";
import { quizDBToQuizFE } from '../../utils-functions/quiz-convert'


const QUIZ_LIMIT = parseInt( process.env.QUIZ_LIMIT!)
const MACROTOPIC_LIMIT = parseInt( process.env.MACROTOPIC_LIMIT!)
const MACROTOPIC_ARRAY_LIMIT = parseInt(process.env.MACROTOPIC_ARRAY_LIMIT!)


export async function fetchQuizMacroQuery(
  myPool: Pool, 
  req: Request, 
  res: Response
){
  try {
    const macroTopicRequest = req.body as MacroTopicRequest;
  
    macroTopicRequestCheck(macroTopicRequest,res)

    const results: QuizDB[] = [];
    for (const macroTopic of macroTopicRequest.arrayMacrotopic) {
      
      macroTopicCheck(macroTopic,res)
      if(!macroTopic.isChecked){
        break;
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

function macroTopicRequestCheck(macroTopicRequest:MacroTopicRequest, res:Response){
  if (!macroTopicRequest || !macroTopicRequest.arrayMacrotopic) {
    return res.status(400).send('Bad request: Missing required fields');
  }
  if(macroTopicRequest.arrayMacrotopic.length>MACROTOPIC_ARRAY_LIMIT){
    return res.status(400).send('Bad request: Too many macro topic elements');
  }
}

function macroTopicCheck(macroTopic:MacroTopicBase, res: Response){
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