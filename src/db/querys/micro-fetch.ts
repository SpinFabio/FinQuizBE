import { Request, Response } from "express";
import { Pool, RowDataPacket } from "mysql2/promise";
import {
  MicrotopicRequest,
  MicroTopicBase,
  MicroTopicResponse,
  microTopicBaseSchema
} from "../../common/micro-topic-interfaces";
import { QuizBE, QuizDB } from "../../common/quiz-interfaces";
import { quizDBToQuizFE } from "../../utils/quiz-convert";
import * as Yup from "yup";
import dotenv from "dotenv";

dotenv.config();
const QUIZ_LIMIT = parseInt(process.env.QUIZ_LIMIT!);
const MICROTOPIC_ARRAY_LIMIT = parseInt(process.env.MICROTOPIC_ARRAY_LIMIT!);

export async function fetchQuizMicroQuery(
  myPool: Pool,
  req: Request,
  res: Response
) {
  try {
    const microTopicRequest = req.body as MicrotopicRequest;
    if (!microTopicRequestCheck(microTopicRequest)) {
      return res.status(400).send("Bad request");
    }

    const results: QuizDB[] = [];
    for (const microTopic of microTopicRequest.arrayMicroTopic) {
      await microTopicBaseSchema.validate(microTopic, { abortEarly: false });
      if (!(microTopic.quantitySelected > 0)) {
        continue;
      }
      const quantitySelected = Math.min(
        microTopic.quantitySelected,
        QUIZ_LIMIT
      );
      const [rows] = await myPool.query<RowDataPacket[]>(
        `
        SELECT *
        FROM quiz
        WHERE macroTopicId = ?
          AND microtopicId = ? 
        ORDER BY RAND()
        LIMIT ?;
      `,
        [microTopic.macroID, microTopic.microID, quantitySelected]
      );
      const quizzes = rows as QuizDB[];
      results.push(...quizzes);
    }

    const resultsForFE: QuizBE[] = results.map((quiz) => quizDBToQuizFE(quiz));

    res.json({
      message: "ecco qui il risultato ella query micro",
      quizesArray: resultsForFE
    });
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      return res.status(400).json({ errors: err.errors });
    }
    console.error("Error: ", err);
    res.status(500).send("Internal server error");
  }
}

function microTopicRequestCheck(microTopicRequest: MicrotopicRequest): boolean {
  if (!microTopicRequest || !microTopicRequest.arrayMicroTopic) {
    return false;
  }
  if (microTopicRequest.arrayMicroTopic.length > MICROTOPIC_ARRAY_LIMIT) {
    return false;
  }

  return true;
}
