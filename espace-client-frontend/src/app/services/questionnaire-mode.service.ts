import { Injectable, signal } from '@angular/core';
import { Mode } from '../models/mode.enum';

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireModeService {
  mode = signal<Mode>(Mode.VIEW);

  get answerMode() {
    return this.mode() === Mode.ANSWER;
  }

  get viewMode() {
    return this.mode() === Mode.VIEW;
  }

  get createMode() {
    return this.mode() === Mode.CREATE;
  }
  get editMode() {
    return this.mode() === Mode.EDIT;
  }

  get emptyMode() {
    return this.mode() === Mode.EMPTY;
  }

  get currentMode() {
    return this.mode();
  }

  setMode(mode: Mode) {
    this.mode.set(mode);
    console.log(this.mode());
  }

  setAnswerMode() {
    this.mode.set(Mode.ANSWER);
  }

  setViewMode() {
    this.mode.set(Mode.VIEW);
  }

  setCreateMode() {
    console.log(this.mode());
    this.mode.set(Mode.CREATE);
    console.log(this.mode());
  }

  setEmptyMode() {
    console.log(this.mode());
    this.mode.set(Mode.EMPTY);
    console.log(this.mode());
  }

  setEditMode() {
    this.mode.set(Mode.EDIT);
  }
}
