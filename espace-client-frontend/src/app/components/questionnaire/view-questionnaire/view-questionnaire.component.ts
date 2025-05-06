import { Component, EventEmitter, inject, Output } from '@angular/core';
import { QuestionnaireFormService } from '../../../services/questionnaire-form.service';
import { ReactiveFormsModule } from '@angular/forms';
import { QuestionnaireSectionComponent } from '../partials/questionnaire-section/questionnaire-section.component';
import { ButtonModule } from 'primeng/button';
import { Mode } from '../../../models/mode.enum';

@Component({
  selector: 'app-view-questionnaire',
  imports: [ReactiveFormsModule, QuestionnaireSectionComponent, ButtonModule],
  templateUrl: './view-questionnaire.component.html',
  styleUrl: './view-questionnaire.component.scss',
})
export class ViewQuestionnaireComponent {
  questionnaireFormService = inject(QuestionnaireFormService);
  @Output() modeEmitter = new EventEmitter<Mode>();
  editable = false;

  switchMode() {
    this.modeEmitter.emit(Mode.EDIT);
  }
}
