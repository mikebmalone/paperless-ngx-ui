import { Routes } from '@angular/router';
import { DocumentListComponent } from './components/document-list/document-list.component';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'documents', 
    pathMatch: 'full'
  },
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'documents', 
    component: DocumentListComponent 
  }
];
