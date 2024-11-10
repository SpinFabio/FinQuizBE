import { QuizBase } from "./quiz-interfaces";
import * as Yup from 'yup';
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


export const macroTopicBaseSchema= Yup.object({
  quantitySelected: Yup.number().required(),
  macroID: Yup.number().min(1).max(5).required(),
  isChecked: Yup.boolean()
})