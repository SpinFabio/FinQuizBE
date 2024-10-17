// base non nel senso di database, ma nel senso che il FE ci aggiunge 2 campi

export interface QuizBase {
  macroTopicID: number;
  microTopicID: number;
  question: string;
  correctAnswer: string;
  allAnswers: string[];
  level: number;
  subcontent: string;
}

export interface QuizDB {
  id: number;                     
  macroTopicId: number;            
  microTopicId: number;            
  question: string;                
  correctAnswer: string;           
  distractor1: string;             
  distractor2: string;             
  distractor3: string;             
  score: number;                   
  subcontent: string;              
}