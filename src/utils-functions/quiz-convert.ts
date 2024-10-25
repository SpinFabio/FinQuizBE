import { QuizBase,QuizDB } from "../common-interfaces/quiz-interfaces";

export function quizDBToQuizFE(quizDB: QuizDB): QuizBase {
  return {
    macroTopicID: quizDB.macroTopicId,   
    microTopicID: quizDB.microTopicId,   
    question: quizDB.question,
    correctAnswer: quizDB.correctAnswer,
    allAnswers: [
      quizDB.correctAnswer, 
      quizDB.distractor1, 
      quizDB.distractor2, 
      quizDB.distractor3
    ].sort(),  // ordinate in ordine alfabetico 
    level: quizDB.score,    
    subcontent: quizDB.subcontent,
  };
}