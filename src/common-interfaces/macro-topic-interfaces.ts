import { QuizBase } from "./quiz-interface";

export interface MacroTopicBase{
  quantitySelected: number;
  macroID: number;
  isChecked: boolean;
}

export interface MacroTopicRequest{
  arrayMacrotopic: MacroTopicBase[];
}

export interface MacroTopicResponse{
  quizesArray: QuizBase[];
}