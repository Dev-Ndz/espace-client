import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { QuestionnaireComponent } from '../questionnaire.component';
import { QuestionnaireModeService } from '../../../services/questionnaire-mode.service';
import { QuestionnaireFormService } from '../../../services/questionnaire-form.service';

@Component({
  selector: 'app-admin-questionnaire',
  imports: [QuestionnaireComponent, ButtonModule],
  templateUrl: './admin-questionnaire.component.html',
  styleUrl: './admin-questionnaire.component.scss',
})
export class AdminQuestionnaireComponent {
  questionnaireModeService = inject(QuestionnaireModeService);
  questionnaireFormService = inject(QuestionnaireFormService);

  createQuestionnaire() {
    this.questionnaireModeService.setCreateMode();
    this.questionnaireFormService.addSection();
  }

  editMode() {
    this.questionnaireModeService.setEditMode();
  }
}
