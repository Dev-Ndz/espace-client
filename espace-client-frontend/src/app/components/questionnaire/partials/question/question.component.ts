import { Component, inject, Input, OnInit } from '@angular/core';

import { Editor } from 'primeng/editor';
import { QuestionnaireService } from '../../../../services/questionnaire.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Delta } from 'quill';

@Component({
  selector: 'app-question',
  imports: [Editor, ReactiveFormsModule],
  templateUrl: './question.component.html',
  styleUrl: './question.component.scss',
})
export class QuestionComponent implements OnInit {
  @Input() index!: number;
  questionnaireService = inject(QuestionnaireService);
  question?: string;
  // get formControl(): FormControl<Delta | string | null> | null {
  //   return this.questionnaireService.questionnaireForm?.at(this.index) ?? null;
  // }
  ngOnInit() {
    // this.question = this.questionnaireService.getQuestion(this.index);
    console.log();
  }
}
