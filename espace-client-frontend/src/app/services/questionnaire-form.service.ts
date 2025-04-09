import { inject, Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireFormService {
  fb = inject(FormBuilder);

  questionnaireForm = this.fb.group({
    sections: this.fb.array([]),
  });

  createSection() {
    return this.fb.group({
      title: [''],
      question: this.fb.array([]),
    });
  }

  createQuestion() {
    return this.fb.group({
      question: [''],
      answer: [''],
    });
  }
  get sectionsControls(): FormGroup[] {
    return (this.questionnaireForm.get('sections') as FormArray)
      .controls as FormGroup[];
  }
  getQuestions(sectionIndex: number): FormGroup[] {
    const section = this.sectionsControls[sectionIndex];
    const questions = section.get('question') as FormArray;
    return questions.controls as FormGroup[];
  }
  addSection(){
    (this.questionnaireForm.get('sections') as FormArray).push(this.createSection())

  }
  addQuestionToSection(sectionIndex: number) {
    const section = this.sectionsControls[sectionIndex];
    const questions = section.get('question') as FormArray;
    questions.push(this.createQuestion());
  }
}
