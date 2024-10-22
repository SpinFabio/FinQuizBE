import { Request, Response } from 'express';
import { Pool, RowDataPacket } from 'mysql2/promise';
import { MicrotopicRequest,MicroTopicBase } from '../../common-interfaces/micro-topic-interfaces';
import { QuizDB } from '../../common-interfaces/quiz-interface';

const QUIZ_LIMIT = parseInt(process.env.QUIZ_LIMIT!)
const MACROTOPIC_LIMIT = parseInt(process.env.MACROTOPIC_LIMIT!)
const MICROTOPIC_LIMIT= parseInt(process.env.MACROTOPIC_LIMIT!)

export async function fetchQuizMicroQuery( 
  myPool: Pool, 
  req: Request, 
  res: Response
){
  try{
    const microtopicRequest = req.body as MicrotopicRequest
    if(!microtopicRequest||!microtopicRequest.arrayMicroTopic){
      return res.status(400).send('Bad request: Missing required fields');
    }

    const results : QuizDB[]=[];
    for (const microTopic of microtopicRequest.arrayMicroTopic){
      microTopicCheck(microTopic, res)
      if(!microTopic.isChecked){
        continue;
      }
      const quantitySelected = Math.min(microTopic.quantitySelected,QUIZ_LIMIT)


    }
    
    
  }catch(err){
    console.error('Error: ', err);
    res.status(500).send('Internal server error');

  }
}



function microTopicCheck(microTopic:MicroTopicBase,res:Response) {
  if(
    !Number.isInteger(microTopic.microID)||
    microTopic.macroID<=0||
    microTopic.macroID>MICROTOPIC_LIMIT
  ){
    return res.status(400).send('Invalid macroTopic ID: The ID must be a positive integer within the allowed range.');
  }

  if(
    !Number.isInteger(microTopic.microID)||
    microTopic.macroID<=0||
    microTopic.macroID>MACROTOPIC_LIMIT
  ){
    return res.status(400).send('Invalid microTopic ID: The ID must be a positive integer within the allowed range.');
  }

  if(
    !Number.isInteger(microTopic.quantitySelected)||
    microTopic.quantitySelected<=0
  ){
    return res.status(400).send('Invalid quantity selected: The quantity must be a positive integer greater than zero.');
  }

}