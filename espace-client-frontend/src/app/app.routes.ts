import { Routes } from '@angular/router';
import { UserComponent } from './components/user/pages/user/user.component';
import { HomeComponent } from './components/user/pages/home/home.component';
import { DocumentsComponent } from './components/user/pages/documents/documents.component';
import { UserInfoComponent } from './components/user/pages/user-info/user-info.component';
import { MoodboardComponent } from './components/user/pages/moodboard/moodboard.component';
import { QuestionnaireComponent } from './components/user/pages/questionnaire/questionnaire.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { AdminPageComponent } from './components/admin/admin-page/admin-page.component';
import { ClientDashboardComponent } from './components/admin/client-dashboard/client-dashboard.component';
import { ClientComponent } from './components/admin/client/client.component';

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
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ],
  },
  {
    path: 'admin',
    component: AdminPageComponent,
    children: [
      { path: 'client-dashboard', component: ClientDashboardComponent },
      { path: 'client', component: ClientComponent },
    ],
  },
  { path: '', redirectTo: 'user/home', pathMatch: 'full' }, // Redirection par défaut
  { path: '**', redirectTo: 'user/home', pathMatch: 'full' }, // Redirection en cas d'erreur d'URL
];
