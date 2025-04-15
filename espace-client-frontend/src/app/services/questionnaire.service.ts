import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Question, Questionnaire } from '../models/questionnaire';
import { QuestionnaireFormService } from './questionnaire-form.service';
import { ClientService } from './client.service';
import { Mode } from '../models/mode.enum';

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireService {
  http = inject(HttpClient);
  questionnaireFormService = inject(QuestionnaireFormService);
  clientService = inject(ClientService);
  QUESTIONNAIRE_API_URL = environment.apiUrl + '/questionnaire';

  questions?: Question[];
  questionnaire = signal<Questionnaire | undefined>(undefined);
  mode = signal<Mode>(Mode.EMPTY);

  submitNewQuetionnaire() {
    const questionnaire = {
      ...this.questionnaireFormService.questionnaireForm.value,
      clientId: this.clientService.client()?.id ?? null,
      isTemplate: false,
    };
    console.log(questionnaire);
    return this.http.post(this.QUESTIONNAIRE_API_URL, questionnaire);
  }

  updateQuestionnaire(id: string) {
    const questionnaireToUpdate = {
      ...this.questionnaireFormService.questionnaireForm.value,
      clientId: this.clientService.client()?.id ?? null,
      isTemplate: false,
    };
    return this.http.patch(
      this.QUESTIONNAIRE_API_URL + '/' + id,
      questionnaireToUpdate
    );
  }

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
    this.http
      .get<Questionnaire[]>(this.QUESTIONNAIRE_API_URL + '/user/' + clientId)
      .subscribe({
        next: (questionnaire: Questionnaire[]) => {
          this.questionnaire.set(questionnaire[0]);
          this.questionnaireFormService.load(questionnaire[0]);
          this.mode.set(Mode.VIEW);
        },
        error: (err) => {
          if (err.status === 404) {
            this.questionnaireFormService.resetForm();
            this.questionnaire.set(undefined);
            this.mode.set(Mode.EMPTY);
          } else {
            console.error('error while fetching data', err);
          }
        },
      });
  }

  // initializeForm(questions?: Question[]) {
  //   const exempleQuestions: Question[] = [
  //     { question: 'ceci est un exemple de question' },
  //     { question: 'voici une autre quesiton' },
  //   ];
  //   this.questions = exempleQuestions;
  //   this.formGroup = new FormGroup({
  //     questionnaireForm: new FormArray<FormControl<Delta | string | null>>(
  //       exempleQuestions.map((q) => new FormControl(q.answer || null))
  //     ),
  //   });
  // }

  // get questionnaireForm(): FormArray<
  //   FormControl<Delta | string | null>
  // > | null {
  //   const formArray = this.formGroup?.get('questionnaireForm');
  //   return formArray as FormArray<FormControl<Delta | string | null>> | null;
  // }

  // getQuestion(index: number) {
  //   return this.questions ? this.questions[index].question : undefined;
  // }

  // submitForm() {
  //   if (this.questionnaireForm) {
  //     this.questionnaireForm?.value.forEach((answer, index) => {
  //       if (this.questions) {
  //         this.questions[index].answer = answer || '';
  //       }
  //     });
  //   }
  // }
}
