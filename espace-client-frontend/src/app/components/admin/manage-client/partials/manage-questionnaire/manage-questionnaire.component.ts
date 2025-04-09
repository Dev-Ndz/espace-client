import { Component, effect, inject } from '@angular/core';
import { QuestionnaireService } from '../../../../../services/questionnaire.service';
import { ClientService } from '../../../../../services/client.service';
import { ButtonModule } from 'primeng/button';
import { Mode } from '../../../../../models/mode.enum';
import { CreateQuestionnaireComponent } from "../../../../questionnaire/create-questionnaire/create-questionnaire.component";

@Component({
  selector: 'app-manage-questionnaire',
  imports: [ButtonModule, CreateQuestionnaireComponent],
  templateUrl: './manage-questionnaire.component.html',
  styleUrl: './manage-questionnaire.component.scss',
})
export class ManageQuestionnaireComponent {
  questionnaireService = inject(QuestionnaireService);
  clientService = inject(ClientService);
  mode: Mode = Mode.VIEW;
  constructor() {
    effect(() => {
      if (this.questionnaireService.questionnaire() === undefined)
        this.mode = Mode.EMPTY;
    });
  }
  ngOnInit() {
    this.questionnaireService.loadQuestionnaire(
      this.clientService.client()?.id
    );
  }
  get emptyMode(): boolean {
    return this.mode === Mode.EMPTY;
  }
  get createMode(): boolean {
    return this.mode === Mode.CREATE;
  }
  get viewMode(): boolean {
    return this.mode === Mode.VIEW;
  }
  createQuestionnaire() {
    this.mode = Mode.CREATE;
  }
}
