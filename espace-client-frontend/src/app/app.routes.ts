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
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { ManageClientComponent } from './components/admin/manage-client/manage-client.component';

export const routes: Routes = [
  {
    path: 'user',
    component: UserComponent,
    canActivate: [authGuard],
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
    canActivate: [adminGuard],
    component: AdminPageComponent,
    children: [
      { path: 'client-dashboard', component: ClientDashboardComponent },
      { path: 'client/:mode/:id', component: ManageClientComponent },
      { path: 'client/:mode', component: ManageClientComponent }, // Route sans ID pour les cas où il n'est pas nécessaire
    ],
  },
  { path: '', redirectTo: 'admin/client-dashboard', pathMatch: 'full' }, // Redirection par défaut
  { path: '**', redirectTo: 'admin/client-dashboard', pathMatch: 'full' }, // Redirection en cas d'erreur d'URL
];
