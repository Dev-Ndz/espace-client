import { Component, effect, inject, Input } from '@angular/core';
import { QuestionnaireFormService } from '../../../../services/questionnaire-form.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { EditorModule } from 'primeng/editor';
import { FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { QuestionnaireModeService } from '../../../../services/questionnaire-mode.service';
@Component({
  selector: 'app-questionnaire-question',
  standalone: true,
  imports: [
    ButtonModule,
    InputTextModule,
    EditorModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './questionnaire-question.component.html',
  styleUrl: './questionnaire-question.component.scss',
})
export class QuestionnaireQuestionComponent {
  @Input() questionIndex!: number;
  @Input() sectionIndex!: number;
  @Input() questionForm!: FormGroup;
  @Input() editable!: boolean;
  questionnaireModeService = inject(QuestionnaireModeService);
  questionnaireFormService = inject(QuestionnaireFormService);

  editQuestionMode = this.editable;
  editAnswerMode = this.editable;

  constructor() {
    effect(() => {
      this.editAnswerMode = this.questionnaireModeService.answerMode;
    });
  }

  ngOnInit() {
    if (
      !this.questionForm.get('question')?.value &&
      (this.questionnaireModeService.createMode ||
        this.questionnaireModeService.editMode)
    ) {
      this.editQuestionMode = true;
    }
  }

  switchQuestionMode() {
    this.editQuestionMode = !this.editQuestionMode;
  }

  moveQuestionUp() {
    this.questionnaireFormService.moveQuestion(
      this.sectionIndex,
      this.questionIndex,
      'up'
    );
  }

  moveQuestionDown() {
    this.questionnaireFormService.moveQuestion(
      this.sectionIndex,
      this.questionIndex,
      'down'
    );
  }
}
