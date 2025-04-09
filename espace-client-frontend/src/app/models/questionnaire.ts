import { Question } from "./question";

export interface Questionnaire {
  id: string;
  titre?: string;
  questions: Question[];
}
