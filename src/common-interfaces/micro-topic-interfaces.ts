import { QuizBase } from "./quiz-interface";

export interface MicroTopicBase{
  quantitySelected: number;
  macroID: number;
  microID: number;
  isChecked: boolean;
}

export interface MicrotopicRequest{
  arrayMicroTopic: MicroTopicBase[];
}

export interface MicroTopicResponse{
  quizesArray: QuizBase[];
}