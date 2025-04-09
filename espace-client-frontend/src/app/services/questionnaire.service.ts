import { inject, Injectable, signal } from '@angular/core';
import { Question } from '../models/question';
import { FormControl, FormArray, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { Delta } from 'quill';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Questionnaire } from '../models/questionnaire';

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireService {
  http = inject(HttpClient);
  QUESTIONNAIRE_API_URL = environment.apiUrl + '/questionnaire';
  formGroup?: FormGroup<{
    questionnaireForm: FormArray<FormControl<Delta | string | null>>;
  }>;
  questions?: Question[];
  questionnaire = signal<Questionnaire | undefined>(undefined);




  
  private fetchQuestionnaireData(
    clientId?: string
  ): Observable<Questionnaire[]> {
    return clientId
      ? this.http.get<Questionnaire[]>(
          this.QUESTIONNAIRE_API_URL + '/user/' + clientId
        )
      : this.http.get<Questionnaire[]>(this.QUESTIONNAIRE_API_URL);
  }

  loadQuestionnaire(clientId?: string) {
    console.log('loadQuestionnaire', clientId);
    this.fetchQuestionnaireData(clientId).subscribe({
      next: (questionnaire: Questionnaire[]) => {
        this.questionnaire.set(questionnaire[0]);
        this.questions = questionnaire[0].questions;
        this.initializeForm(this.questions);
      },
      error: (err) => {
        if (err.status === 404) {
          console.log('coucou');
          this.questionnaire.set(undefined);
        } else {
          console.error('error while fetching data', err);
        }
      },
    });
  }

  initializeForm(questions?: Question[]) {
    const exempleQuestions: Question[] = [
      { question: 'ceci est un exemple de question' },
      { question: 'voici une autre quesiton' },
    ];
    this.questions = exempleQuestions;
    this.formGroup = new FormGroup({
      questionnaireForm: new FormArray<FormControl<Delta | string | null>>(
        exempleQuestions.map((q) => new FormControl(q.answer || null))
      ),
    });
  }

  get questionnaireForm(): FormArray<
    FormControl<Delta | string | null>
  > | null {
    const formArray = this.formGroup?.get('questionnaireForm');
    return formArray as FormArray<FormControl<Delta | string | null>> | null;
  }

  getQuestion(index: number) {
    return this.questions ? this.questions[index].question : undefined;
  }

  submitForm() {
    if (this.questionnaireForm) {
      this.questionnaireForm?.value.forEach((answer, index) => {
        if (this.questions) {
          this.questions[index].answer = answer || '';
        }
      });
    }
  }
}
