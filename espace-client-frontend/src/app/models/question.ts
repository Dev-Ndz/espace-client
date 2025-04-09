import { Delta } from 'quill';
export interface Question {
  question: string;
  answer?: Delta | string;
}
