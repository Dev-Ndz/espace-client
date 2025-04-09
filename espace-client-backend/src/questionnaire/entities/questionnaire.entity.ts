import { Client } from 'src/client/entities/client.entity';
import { Question } from './question.entity';

export class Questionnaire {
  id: string;
  clientId: string;
  client: Client;
  questions: Question[];
}
