export class CreateQuestionnaireDto {
  title?: string;
  clientId?: string;
  isTemplate?: boolean;
  sections: {
    title?: string;
    questions: {
      question?: string;
      answer?: string;
    }[];
  }[];
}
