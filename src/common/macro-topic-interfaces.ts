import { QuizBE } from "./quiz-interfaces";
import * as Yup from "yup";
import { AuthBodyReqRes } from "./user-interfaces";
export interface MacroTopicBase {
  quantitySelected: number;
  macroID: number;
}

export interface MacroTopicRequest extends AuthBodyReqRes {
  arrayMacrotopic: MacroTopicBase[];
}

export interface MacroTopicResponse {
  quizesArray: QuizBE[];
}

export const macroTopicBaseSchema = Yup.object({
  quantitySelected: Yup.number().required(),
  macroID: Yup.number().min(1).max(5).required(),
  isChecked: Yup.boolean()
});
