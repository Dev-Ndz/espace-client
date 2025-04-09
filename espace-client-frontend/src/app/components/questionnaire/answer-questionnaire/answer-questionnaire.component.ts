import { Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ReactiveFormsModule } from '@angular/forms';
import { QuestionnaireService } from '../../../services/questionnaire.service';
import { QuestionComponent } from '../partials/question/question.component';

@Component({
  selector: 'app-answer-questionnaire',
  imports: [ButtonModule, ReactiveFormsModule, QuestionComponent],
  templateUrl: './answer-questionnaire.component.html',
  styleUrl: './answer-questionnaire.component.scss',
})
export class AnswerQuestionnaireComponent implements OnInit {
  questionnaireService = inject(QuestionnaireService);
  answer1 =''
  answer2 =''

  onSubmit(){
    this.questionnaireService.formGroup
  }
  ngOnInit() {
    // this.questionnaireService.loadQuestionnaire();
    this.questionnaireService.initializeForm();
  }
}
