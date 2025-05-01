import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Document, DocumentListResponse, DocumentTypeListResponse } from '../models/document.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaperlessService {
  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}

  getDocuments(page: number = 1, pageSize: number = 25): Observable<DocumentListResponse> {
    const url = `${this.apiUrl}/documents/?page=${page}&page_size=${pageSize}`;
    return this.http.get<DocumentListResponse>(url, { 
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    }).pipe(
      tap(response => {
        if (environment.debug) {
          console.log('Documents response:', response);
        }
      }),
      catchError(this.handleError)
    );
  }

  getDocument(id: number): Observable<Document> {
    const url = `${this.apiUrl}/documents/${id}/`;
    return this.http.get<Document>(url, { 
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    }).pipe(
      tap(response => {
        if (environment.debug) {
          console.log('Document response:', response);
        }
      }),
      catchError(this.handleError)
    );
  }

  getDocumentTypes(): Observable<DocumentTypeListResponse> {
    const url = `${this.apiUrl}/document_types/`;
    return this.http.get<DocumentTypeListResponse>(url, { 
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    }).pipe(
      tap(response => {
        if (environment.debug) {
          console.log('Document types response:', response);
        }
      }),
      catchError(this.handleError)
    );
  }

  getDocumentsByType(typeId: number, page: number = 1, pageSize: number = 25): Observable<DocumentListResponse> {
    const url = `${this.apiUrl}/documents/?document_type=${typeId}&page=${page}&page_size=${pageSize}`;
    return this.http.get<DocumentListResponse>(url, { 
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    }).pipe(
      tap(response => {
        if (environment.debug) {
          console.log('Documents by type response:', response);
        }
      }),
      catchError(this.handleError)
    );
  }

  getDocumentPreviewUrl(id: number): string {
    return `${this.apiUrl}/documents/${id}/preview/`;
  }

  getDocumentDownloadUrl(id: number): string {
    return `${this.apiUrl}/documents/${id}/download/`;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    
    if (error.status === 401 || error.status === 403) {
      errorMessage = 'Not authenticated';
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      errorMessage = `Server error: ${error.message}`;
    }
    
    if (environment.debug) {
      console.error('API Error:', error);
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
