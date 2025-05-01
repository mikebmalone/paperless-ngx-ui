import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';

import { PaperlessService } from '../../services/paperless.service';
import { Document } from '../../models/document.interface';

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatListModule,
    DatePipe
  ],
  templateUrl: './document-detail.component.html',
  styleUrl: './document-detail.component.scss'
})
export class DocumentDetailComponent implements OnInit {
  document: Document | null = null;
  isLoading = true;
  errorMessage = '';
  documentId: number = 0;

  constructor(
    private paperlessService: PaperlessService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.documentId = +id;
        this.loadDocument(this.documentId);
      } else {
        this.errorMessage = 'Invalid document ID';
        this.isLoading = false;
      }
    });
  }

  loadDocument(id: number): void {
    this.isLoading = true;
    this.paperlessService.getDocument(id).subscribe({
      next: (document) => {
        this.document = document;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = `Error loading document: ${error.message}`;
        this.isLoading = false;
      }
    });
  }

  getPreviewUrl(): string {
    return this.paperlessService.getDocumentPreviewUrl(this.documentId);
  }

  getDownloadUrl(): string {
    return this.paperlessService.getDocumentDownloadUrl(this.documentId);
  }

  goBack(): void {
    this.router.navigate(['/documents']);
  }
}

