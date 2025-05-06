import { Component, effect, inject} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ReactiveFormsModule } from '@angular/forms';
import { QuestionnaireService } from '../../services/questionnaire.service';
import { ClientService } from '../../services/client.service';
import { QuestionnaireFormService } from '../../services/questionnaire-form.service';
import { QuestionnaireSectionComponent } from './partials/questionnaire-section/questionnaire-section.component';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { QuestionnaireModeService } from '../../services/questionnaire-mode.service';
@Component({
  selector: 'app-questionnaire',
  imports: [
    ButtonModule,
    ReactiveFormsModule,
    QuestionnaireSectionComponent,
    CommonModule,
  ],
  providers: [MessageService],
  templateUrl: './questionnaire.component.html',
  styleUrl: './questionnaire.component.scss',
})
export class QuestionnaireComponent {
  questionnaireFormService = inject(QuestionnaireFormService);
  questionnaireService = inject(QuestionnaireService);
  questionnaireModeService = inject(QuestionnaireModeService);
  private clientService = inject(ClientService);
  messageService = inject(MessageService);

  constructor() {
    effect(() => {
      const clientId = this.clientService.client()?.id;
      if (clientId && !this.questionnaireModeService.createMode) {
        this.questionnaireService.loadQuestionnaire(clientId);
      }
    });
  }

  editMode() {
    this.questionnaireModeService.setAnswerMode();
  }
  submit() {
    const subscribeParams = {
      next: (data: any) => {
        console.log('saved questionnaire', data);
        this.messageService.add({
          severity: 'success',
          summary: 'questionnaire enregistré',
          detail: 'questionnaire enregistré',
        });
        this.questionnaireModeService.setViewMode();
      },
      error: (error: any) => {
        console.log('error', error);
        this.messageService.add({
          severity: 'error',
          summary: 'questionnaire non enregistré',
          detail: 'questionnaire non enregistré',
        });
      },
    };
    if (this.questionnaireModeService.createMode) {
      this.questionnaireService
        .submitNewQuetionnaire()
        .subscribe(subscribeParams);
    } else {
      this.questionnaireService
        .updateQuestionnaire()
        .subscribe(subscribeParams);
    }
  }
}
