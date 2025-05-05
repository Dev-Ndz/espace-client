export interface Questionnaire {
  id?: string;
  title?: string;
  isTemplate?: boolean;
  clientId?: string;
  createdAt?: Date;
  sections?: Section[];
}

export interface Section {
  id?: string;
  title?: string;
  questionnaireId?: string;
  questions?: Question[];
}
export interface Question {
  id?: string;
  question?: string;
  answer?: string;
  sectionId?: string;
}
