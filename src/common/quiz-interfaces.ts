import { RowDataPacket } from "mysql2";

export interface QuizRow extends QuizDB, RowDataPacket {}

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

export interface QuizBE {
  macroTopicID: number;
  microTopicID: number;
  question: string;
  correctAnswer: string;
  allAnswers: string[];
  level: number;
  subcontent: string;
}
