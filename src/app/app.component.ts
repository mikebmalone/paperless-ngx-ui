import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DocumentTypesComponent } from './components/document-types/document-types.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    DocumentTypesComponent
  ],
  template: `
    <main>
      <div class="header">
        <div class="logo-container">
          <img src="assets/HOPE-logo.svg" alt="Hope Aged Care Logo" class="logo" />
        </div>
      </div>
      
      <div class="content">
        <div class="layout-container">
          <app-document-types class="sidebar"></app-document-types>
          <div class="main-content">
            <router-outlet></router-outlet>
          </div>
        </div>
      </div>
    </main>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Hope Aged Care Document Management';
}
