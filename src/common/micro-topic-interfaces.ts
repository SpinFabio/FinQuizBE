import { QuizBE } from "./quiz-interfaces";
import * as Yup from "yup";

export interface MicroTopicBase {
  quantitySelected: number;
  macroID: number;
  microID: number;
}

export interface MicrotopicRequest {
  arrayMicroTopic: MicroTopicBase[];
}

export interface MicroTopicResponse {
  quizesArray: QuizBE[];
}

export const microTopicBaseSchema = Yup.object({
  quantitySelected: Yup.number().required(),
  macroID: Yup.number().min(1).max(5).required(),
  microID: Yup.number()
    .required()
    .test(
      "range-check-for-microID",
      "Il numero deve essere in uno degli intervalli validi: 101-115, 201-215, 301-304, 401-411, 501-512",
      (value) => {
        return (
          (value >= 101 && value <= 115) ||
          (value >= 201 && value <= 215) ||
          (value >= 301 && value <= 304) ||
          (value >= 401 && value <= 411) ||
          (value >= 501 && value <= 512)
        );
      }
    ),
});
