import { Component, inject } from '@angular/core';
import { QuestionnaireComponent } from '../questionnaire.component';
import { QuestionnaireModeService } from '../../../services/questionnaire-mode.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-user-questionnaire',
  imports: [QuestionnaireComponent, ButtonModule],
  templateUrl: './user-questionnaire.component.html',
  styleUrl: './user-questionnaire.component.scss',
})
export class UserQuestionnaireComponent {
  questionnaireModeService = inject(QuestionnaireModeService);
  ngOnInit() {
    this.questionnaireModeService.setAnswerMode();
  }
  editMode() {
    this.questionnaireModeService.setAnswerMode();
  }
}
