import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Questionnaire } from '../models/questionnaire';
import { QuestionnaireFormService } from './questionnaire-form.service';
import { ClientService } from './client.service';
import { Mode } from '../models/mode.enum';
import { QuestionnaireModeService } from './questionnaire-mode.service';
@Injectable({
  providedIn: 'root',
})
export class QuestionnaireService {
  http = inject(HttpClient);
  questionnaireFormService = inject(QuestionnaireFormService);
  questionnaireModeService = inject(QuestionnaireModeService);
  clientService = inject(ClientService);
  QUESTIONNAIRE_API_URL = environment.apiUrl + '/questionnaire';

  questionnaire = signal<Questionnaire | undefined>(undefined);

  submitNewQuetionnaire() {
    const questionnaire = {
      ...this.questionnaireFormService.questionnaireForm.value,
      clientId: this.clientService.client()?.id ?? null,
      isTemplate: false,
    };
    console.log(questionnaire);
    return this.http.post(this.QUESTIONNAIRE_API_URL, questionnaire);
  }

  updateQuestionnaire(id?: string) {
    const questionnaireId = id ?? this.questionnaire()?.id;
    const questionnaireToUpdate = {
      ...this.questionnaireFormService.questionnaireForm.value,
      clientId: this.clientService.client()?.id ?? null,
      isTemplate: false,
    };

    return this.http.patch(
      this.QUESTIONNAIRE_API_URL + '/' + questionnaireId,
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
        },
        error: (err) => {
          if (err.status === 404) {
            this.questionnaireFormService.resetForm();
            this.questionnaire.set(undefined);
            !this.questionnaireModeService.createMode &&
              this.questionnaireModeService.setEmptyMode();
          } else {
            console.error('error while fetching data', err);
          }
        },
      });
  }
}
