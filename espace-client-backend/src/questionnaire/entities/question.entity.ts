import { Questionnaire } from './questionnaire.entity';

export class Question {
  id: string;
  question: string;
  answer?: string;
  questionnaireId: string;
  questionnaire: Questionnaire;
}
