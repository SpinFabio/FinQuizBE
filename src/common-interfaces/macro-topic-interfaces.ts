import { QuizBase } from "./quiz-interfaces";

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