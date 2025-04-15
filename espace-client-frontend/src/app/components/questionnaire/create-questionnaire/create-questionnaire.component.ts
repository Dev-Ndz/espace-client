import { Component, EventEmitter, inject, Output } from '@angular/core';
import { QuestionnaireFormService } from '../../../services/questionnaire-form.service';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { QuestionnaireSectionComponent } from '../questionnaire-section/questionnaire-section.component';
import { QuestionnaireService } from '../../../services/questionnaire.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { Mode } from '../../../models/mode.enum';

@Component({
  selector: 'app-create-questionnaire',
  providers: [MessageService],
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    QuestionnaireSectionComponent,
  ],
  templateUrl: './create-questionnaire.component.html',
  styleUrl: './create-questionnaire.component.scss',
})
export class CreateQuestionnaireComponent {
  questionnaireFormService = inject(QuestionnaireFormService);
  questionnaireService = inject(QuestionnaireService);
  messageService = inject(MessageService);
  router = inject(Router);
  @Output() modeEmitter = new EventEmitter();
  submit() {
    const questionnaire = this.questionnaireService.questionnaire();
    if (questionnaire?.id) {
      this.questionnaireService
        .updateQuestionnaire(questionnaire.id)
        .subscribe((data) => {
          console.log('update questionnaire', data);
          this.messageService.add({
            severity: 'success',
            summary: 'questionnaire enregistré',
            detail: 'questionnaire enregistré',
          });
          this.modeEmitter.emit(Mode.VIEW);
        });
    } else {
      this.questionnaireService.submitNewQuetionnaire().subscribe((data) => {
        console.log('submit new questionnaire', data);
        this.messageService.add({
          severity: 'success',
          summary: 'questionnaire enregistré',
          detail: 'questionnaire enregistré',
        });
        this.modeEmitter.emit(Mode.VIEW);
      });
    }
  }
}
