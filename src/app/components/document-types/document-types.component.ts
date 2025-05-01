import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

import { PaperlessService } from '../../services/paperless.service';
import { AuthService } from '../../services/auth.service';
import { DocumentType } from '../../models/document.interface';

@Component({
  selector: 'app-document-types',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  template: `
    <div class="types-card">
      <div class="header">
        <h2>Document Types</h2>
      </div>

      <div class="content">
        <div *ngIf="isLoading" class="spinner-container">
          Loading...
        </div>

        <div *ngIf="errorMessage" class="error-container">
          <p class="error-message">{{ errorMessage }}</p>
          <button class="btn" (click)="handleLogin()" *ngIf="!isAuthenticated">
            Login
          </button>
          <button class="btn" (click)="retryLoad()" *ngIf="isAuthenticated">
            Retry
          </button>
        </div>

        <nav *ngIf="!errorMessage" class="nav-list">
          <a class="nav-item" 
             [class.active]="!selectedTypeId"
             (click)="showAllDocuments()">
            <span class="title">All Documents</span>
            <span class="count">{{ totalDocuments || 0 }}</span>
          </a>
          
          <hr class="divider">
          
          <a class="nav-item" 
             *ngFor="let type of documentTypes" 
             [class.active]="selectedTypeId === type.id"
             (click)="showDocumentsOfType(type)">
            <span class="title">{{ type.name }}</span>
            <span class="count">{{ type.document_count || 0 }}</span>
          </a>

          <div *ngIf="documentTypes.length === 0 && !isLoading" class="empty-state">
            <p>No document types found</p>
          </div>
        </nav>
      </div>
    </div>
  `,
  styles: [`
    .types-card {
      margin: 0;
      height: 100%;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header {
      padding: 16px;
      border-bottom: 1px solid #e5e5e5;
    }

    .content {
      padding: 16px;
    }

    .spinner-container {
      display: flex;
      justify-content: center;
      padding: 20px;
    }

    .error-container {
      padding: 16px;
      color: #f44336;
      background-color: #ffebee;
      border-radius: 4px;
      margin: 8px;
    }

    .empty-state {
      padding: 16px;
      text-align: center;
      color: rgba(0, 0, 0, 0.54);
    }

    .nav-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .nav-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-radius: 4px;
      cursor: pointer;
      color: rgba(0, 0, 0, 0.87);
      text-decoration: none;
    }

    .nav-item:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .nav-item.active {
      background-color: rgba(0, 0, 0, 0.08);
    }

    .title {
      font-weight: 500;
    }

    .count {
      color: rgba(0, 0, 0, 0.54);
    }

    .divider {
      margin: 8px 0;
      border: none;
      border-top: 1px solid #e5e5e5;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 4px;
      border: none;
      background-color: #1976d2;
      color: white;
      cursor: pointer;
    }

    .btn:hover {
      background-color: #1565c0;
    }
  `]
})
export class DocumentTypesComponent implements OnInit {
  documentTypes: DocumentType[] = [];
  isLoading = false;
  errorMessage = '';
  selectedTypeId: number | null = null;
  totalDocuments = 0;
  isAuthenticated = false;

  constructor(
    private paperlessService: PaperlessService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(
      isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
        if (isAuthenticated) {
          this.loadDocumentTypes();
        } else {
          this.errorMessage = 'Please login to view document types';
        }
      }
    );

    this.route.queryParams.subscribe(params => {
      this.selectedTypeId = params['type'] ? Number(params['type']) : null;
    });
  }

  handleLogin() {
    this.router.navigate(['/login']);
  }

  retryLoad() {
    this.errorMessage = '';
    this.loadDocumentTypes();
  }

  loadDocumentTypes() {
    if (!this.isAuthenticated) {
      this.errorMessage = 'Please login to view document types';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.paperlessService.getDocuments(1, 1).subscribe({
      next: (response) => {
        this.totalDocuments = response.count;
      },
      error: (error) => {
        console.error('Error loading total documents count:', error);
      }
    });

    this.paperlessService.getDocumentTypes()
      .subscribe({
        next: (response) => {
          this.documentTypes = response.results;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load document types: ' + error.message;
          this.isLoading = false;
          if (error.message.includes('Not authenticated')) {
            this.handleLogin();
          }
        }
      });
  }

  showDocumentsOfType(type: DocumentType) {
    this.selectedTypeId = type.id;
    this.router.navigate(['/documents'], { 
      queryParams: { type: type.id } 
    });
  }

  showAllDocuments() {
    this.selectedTypeId = null;
    this.router.navigate(['/documents']);
  }
}
