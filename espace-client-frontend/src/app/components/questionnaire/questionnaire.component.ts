import { Component, inject, OnInit,} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ReactiveFormsModule } from '@angular/forms';
import { AnswerQuestionnaireComponent } from './answer-questionnaire/answer-questionnaire.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-questionnaire',
  imports: [
    ButtonModule,
    ReactiveFormsModule,
    AnswerQuestionnaireComponent,
  ],
  templateUrl: './questionnaire.component.html',
  styleUrl: './questionnaire.component.scss',
})
export class QuestionnaireComponent implements OnInit {
    userType?: 'USER' | 'ADMIN';
    router = inject(Router)

    ngOnInit() {
      if (this.router.url.includes('/admin')) {
        this.userType = 'ADMIN';
      } else {
        this.userType = 'USER';
      }
    }
    
}
