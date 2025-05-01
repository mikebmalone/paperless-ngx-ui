import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Document } from '../../models/document.interface';
import { PaperlessService } from '../../services/paperless.service';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [
    CommonModule
  ],
  template: `
    <div class="container">
      <div class="card">
        <div class="card-header">
          <h2>Documents</h2>
          <div class="search">
            <input 
              type="text" 
              placeholder="Search documents..."
              (input)="onSearch($event)"
            >
          </div>
        </div>

        <div class="content">
          <div *ngIf="isLoading" class="loading">
            Loading documents...
          </div>

          <div *ngIf="errorMessage" class="error">
            {{ errorMessage }}
          </div>

          <div *ngIf="!isLoading && !errorMessage" class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Created Date</th>
                  <th>File Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let doc of documents">
                  <td>{{ doc.title }}</td>
                  <td>{{ doc.created_date | date:'short' }}</td>
                  <td>{{ doc.file_type }}</td>
                  <td class="actions">
                    <button (click)="viewDocument(doc.id)" class="btn">View</button>
                    <a [href]="getPreviewUrl(doc.id)" target="_blank" class="btn">Preview</a>
                    <a [href]="getDownloadUrl(doc.id)" class="btn">Download</a>
                  </td>
                </tr>
                <tr *ngIf="documents.length === 0">
                  <td colspan="4" class="no-data">No documents found</td>
                </tr>
              </tbody>
            </table>

            <div class="pagination">
              <button 
                class="btn"
                [disabled]="currentPage === 1"
                (click)="changePage(currentPage - 1)"
              >Previous</button>
              <span>Page {{ currentPage }} of {{ totalPages }}</span>
              <button 
                class="btn"
                [disabled]="currentPage === totalPages"
                (click)="changePage(currentPage + 1)"
              >Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 16px;
    }

    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .card-header {
      padding: 16px;
      border-bottom: 1px solid #e5e5e5;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .search input {
      padding: 8px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      width: 250px;
    }

    .content {
      padding: 16px;
    }

    .loading {
      text-align: center;
      padding: 20px;
    }

    .error {
      color: #f44336;
      background-color: #ffebee;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      text-align: left;
      padding: 12px;
      border-bottom: 1px solid #e5e5e5;
    }

    th {
      background-color: #f5f5f5;
      font-weight: 500;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .btn {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      background-color: #1976d2;
      color: white;
      cursor: pointer;
      text-decoration: none;
      font-size: 14px;
    }

    .btn:hover {
      background-color: #1565c0;
    }

    .btn:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .no-data {
      text-align: center;
      color: rgba(0, 0, 0, 0.54);
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-top: 16px;
      padding: 16px;
    }
  `]
})
export class DocumentListComponent implements OnInit {
  documents: Document[] = [];
  isLoading = false;
  errorMessage = '';
  currentPage = 1;
  pageSize = 25;
  totalDocuments = 0;
  totalPages = 1;
  searchTerm = '';

  constructor(
    private paperlessService: PaperlessService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.currentPage = Number(params['page']) || 1;
      this.loadDocuments();
    });
  }

  loadDocuments() {
    this.isLoading = true;
    this.errorMessage = '';

    this.paperlessService.getDocuments(this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.documents = response.results;
          this.totalDocuments = response.count;
          this.totalPages = Math.ceil(this.totalDocuments / this.pageSize);
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load documents: ' + error.message;
          this.isLoading = false;
        }
      });
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.currentPage = 1;
    this.loadDocuments();
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge'
    });
  }

  viewDocument(documentId: number) {
    this.router.navigate(['/documents', documentId]);
  }

  getDownloadUrl(documentId: number): string {
    return this.paperlessService.getDocumentDownloadUrl(documentId);
  }

  getPreviewUrl(documentId: number): string {
    return this.paperlessService.getDocumentPreviewUrl(documentId);
  }
}
