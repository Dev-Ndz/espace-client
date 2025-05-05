import { Component, effect, inject } from '@angular/core';
import { QuestionnaireService } from '../../../../../services/questionnaire.service';
import { ClientService } from '../../../../../services/client.service';
import { ButtonModule } from 'primeng/button';
import { Mode } from '../../../../../models/mode.enum';
import { ViewQuestionnaireComponent } from '../../../../../components/questionnaire/view-questionnaire/view-questionnaire.component';
import { CreateQuestionnaireComponent } from '../../../../../components/questionnaire/create-questionnaire/create-questionnaire.component';

@Component({
  selector: 'app-manage-questionnaire',
  imports: [
    ViewQuestionnaireComponent,
    CreateQuestionnaireComponent,
    ButtonModule,
  ],
  templateUrl: './manage-questionnaire.component.html',
  styleUrl: './manage-questionnaire.component.scss',
})
export class ManageQuestionnaireComponent {
  questionnaireService = inject(QuestionnaireService);
  private clientService = inject(ClientService);

  constructor() {
    effect(() => {
      const clientId = this.clientService.client()?.id;
      if (clientId) {
        this.questionnaireService.loadQuestionnaire(clientId);
      }
    });
  }

  createQuestionnaire() {
    this.questionnaireService.mode.set(Mode.CREATE);
  }

  switchMode(mode: Mode) {
    this.questionnaireService.mode.set(mode);
  }
}
