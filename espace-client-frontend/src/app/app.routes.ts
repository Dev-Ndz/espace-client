import { Routes } from '@angular/router';
import { UserComponent } from './components/user/pages/user/user.component';
import { HomeComponent } from './components/user/pages/home/home.component';
import { DocumentsComponent } from './components/user/pages/documents/documents.component';
import { UserInfoComponent } from './components/user/pages/user-info/user-info.component';
import { MoodboardComponent } from './components/user/pages/moodboard/moodboard.component';
import { QuestionnaireComponent } from './components/user/pages/questionnaire/questionnaire.component';

export const routes: Routes = [
  {
    path: 'user',
    component: UserComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'documents', component: DocumentsComponent },
      { path: 'data', component: UserInfoComponent },
      { path: 'moodboard', component: MoodboardComponent },
      { path: 'questionnaire', component: QuestionnaireComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }, // Redirection vers "home"
    ],
  },
  { path: '', redirectTo: 'user/home', pathMatch: 'full' }, // Redirection par défaut
  { path: '**', redirectTo: 'user/home', pathMatch: 'full' }, // Redirection en cas d'erreur d'URL
];
