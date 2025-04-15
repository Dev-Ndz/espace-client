import { inject, Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Question, Questionnaire, Section } from '../models/questionnaire';

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireFormService {
  fb = inject(FormBuilder);
  
  questionnaireForm = this.fb.group({
    sections: this.fb.array([]),
  });

  createSection(section?: Section) {
    const sectionFormGroup = this.fb.group({
      title: [section?.title || ''],
      questions: this.fb.array([]),
    });
    const questionsFormArray = sectionFormGroup.get('questions') as FormArray;
    section?.questions?.forEach((q) =>
      questionsFormArray.push(this.createQuestion(q))
    );
    return sectionFormGroup;
  }

  createQuestion(question?: Question) {
    return this.fb.group({
      question: [question?.question || ''],
      answer: [question?.answer || ''],
    });
  }

  removeSection(index: number): void {
    this.sections.removeAt(index);
  }

  removeQuestion(sectionIndex: number, questionIndex: number): void {
    const section = this.sectionsControls[sectionIndex];
    const questions = section.get('questions') as FormArray;
    questions.removeAt(questionIndex);
  }

  get sectionsControls(): FormGroup[] {
    return this.sections.controls as FormGroup[];
  }
  get sections(): FormArray {
    return this.questionnaireForm.get('sections') as FormArray;
  }
  getQuestions(sectionIndex: number): FormGroup[] {
    const section = this.sectionsControls[sectionIndex];
    const questions = section.get('questions') as FormArray;
    return questions.controls as FormGroup[];
  }
  addSection() {
    this.sections.push(this.createSection());
  }
  addQuestionToSection(sectionIndex: number) {
    const section = this.sectionsControls[sectionIndex];
    const questions = section.get('questions') as FormArray;
    questions.push(this.createQuestion());
  }
  moveQuestion(
    sectionIndex: number,
    index: number,
    direction: 'up' | 'down'
  ): void {
    const section = this.sectionsControls[sectionIndex];
    const questions = section.get('question') as FormArray;

    if (direction === 'up' && index > 0) {
      const item = questions.at(index);
      questions.removeAt(index);
      questions.insert(index - 1, item);
    } else if (direction === 'down' && index < questions.length - 1) {
      const item = questions.at(index);
      questions.removeAt(index);
      questions.insert(index + 1, item);
    }
  }

  moveSection(index: number, direction: 'up' | 'down'): void {
    if (direction === 'up' && index > 0) {
      const item = this.sections.at(index);
      this.sections.removeAt(index);
      this.sections.insert(index - 1, item);
    } else if (direction === 'down' && index < this.sections.length - 1) {
      const item = this.sections.at(index);
      this.sections.removeAt(index);
      this.sections.insert(index + 1, item);
    }
  }
  resetForm() {
    while (this.sections.length > 0) {
      this.sections.removeAt(0);
    }
    this.questionnaireForm.reset();
  }
  load(data: Questionnaire) {
    console.log('initializing', data);
    this.resetForm();
    data.sections?.forEach((section) => {
      this.sections.push(this.createSection(section));
    });
    console.log(this.questionnaireForm.value);
  }
}
