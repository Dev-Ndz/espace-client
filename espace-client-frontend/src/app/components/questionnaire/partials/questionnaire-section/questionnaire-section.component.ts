import { Component, inject, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { QuestionnaireFormService } from '../../../../services/questionnaire-form.service';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { QuestionnaireQuestionComponent } from '../questionnaire-question/questionnaire-question.component';
import { CommonModule } from '@angular/common';
import { QuestionnaireModeService } from '../../../../services/questionnaire-mode.service';

@Component({
  selector: 'app-questionnaire-section',
  imports: [
    ButtonModule,
    ReactiveFormsModule,
    InputTextModule,
    QuestionnaireQuestionComponent,
    CommonModule,
  ],
  templateUrl: './questionnaire-section.component.html',
  styleUrl: './questionnaire-section.component.scss',
})
export class QuestionnaireSectionComponent {
  @Input() index!: number;
  @Input() section!: FormGroup;
  questionnaireFormService = inject(QuestionnaireFormService);
  questionnaireModeService = inject(QuestionnaireModeService);
  editMode = false;
  ngOnInit() {
    if (
      !this.section.get('title')?.value &&
      (this.questionnaireModeService.createMode ||
        this.questionnaireModeService.editMode)
    ) {
      this.editMode = true;
    }
  }
  get editable() {
    return (
      this.questionnaireModeService.editMode ||
      this.questionnaireModeService.createMode
    );
  }

  showSection = true;
  switchMode() {
    this.editMode = !this.editMode;
  }
  switchView() {
    this.showSection = !this.showSection;
  }

  moveSectionUp() {
    this.questionnaireFormService.moveSection(this.index, 'up');
  }
  moveSectionDown() {
    this.questionnaireFormService.moveSection(this.index, 'down');
  }
}
