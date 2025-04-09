import { Component, inject } from '@angular/core';
import { QuestionnaireFormService } from '../../../services/questionnaire-form.service';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Editor } from 'primeng/editor';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-create-questionnaire',
  imports: [ReactiveFormsModule, ButtonModule, Editor, InputTextModule],
  templateUrl: './create-questionnaire.component.html',
  styleUrl: './create-questionnaire.component.scss',
})
export class CreateQuestionnaireComponent {
  questionnaireFormService = inject(QuestionnaireFormService);
  submit() {
    console.log(this.questionnaireFormService.questionnaireForm.value);
  }
}
