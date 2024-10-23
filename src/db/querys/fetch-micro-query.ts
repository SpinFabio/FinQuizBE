import { Request, Response } from 'express';
import { Pool, RowDataPacket } from 'mysql2/promise';
import { MicrotopicRequest,MicroTopicBase, MicroTopicResponse } from '../../common-interfaces/micro-topic-interfaces';
import { QuizBase, QuizDB } from '../../common-interfaces/quiz-interface';
import { quizDBToQuizFE } from '../../utils-functions/quiz-convert';
import dotenv from 'dotenv';

dotenv.config();
const QUIZ_LIMIT = parseInt(process.env.QUIZ_LIMIT!)
const MACROTOPIC_LIMIT = parseInt(process.env.MACROTOPIC_LIMIT!)
const MICROTOPIC_LIMIT= parseInt(process.env.MICROTOPIC_LIMIT!)
const MICROTOPIC_ARRAY_LIMIT = parseInt(process.env.MICROTOPIC_ARRAY_LIMIT!)

export async function fetchQuizMicroQuery( 
  myPool: Pool, 
  req: Request, 
  res: Response
){
  try{
    const microTopicRequest = req.body as MicrotopicRequest
    if(!microTopicRequestCheck(microTopicRequest)){
      return res.status(400).send('Bad request');
    }

    const results : QuizDB[]=[];
    for (const microTopic of microTopicRequest.arrayMicroTopic){
      if(!microTopicCheck(microTopic)){
        return res.status(400).send('Invalid input: Check macroTopic ID, microTopic ID, and quantity selected.')
      }
      if(!microTopic.isChecked){
        continue;
      }
      const quantitySelected = Math.min(microTopic.quantitySelected,QUIZ_LIMIT)
      const [rows] = await myPool.query<RowDataPacket[]>(`
        SELECT *
        FROM quiz
        WHERE macroTopicId = ?
          AND microtopicId = ? 
        ORDER BY RAND()
        LIMIT ?;
      `, [microTopic.macroID, microTopic.microID ,  quantitySelected])
        const quizzes = rows as QuizDB[];
        results.push(...quizzes)
    }
    

    const resultsForFE: QuizBase[] = results.map(quiz=>quizDBToQuizFE(quiz))
    
    
    //console.log('result for frontend: ')
    //console.log(resultsForFE)

    res.json({
      message: 'ecco qui il risultato ella query micro',
      quizesArray: resultsForFE
    })

  }catch(err){
    console.error('Error: ', err);
    res.status(500).send('Internal server error');
  }
}

function microTopicRequestCheck(microTopicRequest: MicrotopicRequest):boolean{
  if(!microTopicRequest||!microTopicRequest.arrayMicroTopic){
    return false;
  }
  if(microTopicRequest.arrayMicroTopic.length>MICROTOPIC_ARRAY_LIMIT){
    return false;
  }
  
  return true;
}

function microTopicCheck(microTopic:MicroTopicBase):boolean{
  const macroID = microTopic.macroID
  const microID= microTopic.microID
  const remainer= microID%(macroID*100)

  if(
    !Number.isInteger(microTopic.macroID)||
    macroID<=0||
    macroID>MACROTOPIC_LIMIT
  ){
    return false
  }

  if(
    !Number.isInteger(microTopic.microID)||
    microID<=0||
    microID>MICROTOPIC_LIMIT
  ){
    return false
  }

  if(
    !Number.isInteger(microTopic.quantitySelected)||
    microTopic.quantitySelected<=0
  ){
    return false
  }
  

  if(
    remainer==0 ||
    remainer>100
  ){
    return false
  }

  return true
}