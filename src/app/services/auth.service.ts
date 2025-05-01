import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.accountsUrl;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('AuthService initialized with baseUrl:', this.baseUrl);
    this.checkAuthStatus();
  }

  private getLoginPageAndToken(): Observable<string> {
    console.log('Fetching login page for CSRF token');
    return this.http.get(`${this.baseUrl}/login/`, {
      responseType: 'text',
      withCredentials: true
    }).pipe(
      tap(html => {
        console.log('Login page response received');
        console.log('Cookies:', document.cookie);
      }),
      map(html => {
        const match = html.match(/name="csrfmiddlewaretoken" value="([^"]+)"/);
        if (!match) {
          console.error('No CSRF token found in login page HTML');
          throw new Error('CSRF token not found');
        }
        const token = match[1];
        console.log('CSRF token extracted:', token.substring(0, 8) + '...');
        return token;
      }),
      catchError(error => {
        console.error('Error fetching login page:', error);
        return throwError(() => new Error('Failed to get login page'));
      })
    );
  }

  login(username: string, password: string): Observable<any> {
    console.log('Login attempt for user:', username);
    
    return this.getLoginPageAndToken().pipe(
      switchMap(csrfToken => {
        console.log('Preparing login request with token');
        
        const formData = new URLSearchParams();
        formData.set('login', username);
        formData.set('password', password);
        formData.set('csrfmiddlewaretoken', csrfToken);

        const headers = new HttpHeaders()
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .set('X-CSRFToken', csrfToken)
          .set('X-Requested-With', 'XMLHttpRequest');

        console.log('Sending login request with headers:', {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRFToken': csrfToken.substring(0, 8) + '...',
          'X-Requested-With': 'XMLHttpRequest'
        });

        return this.http.post(`${this.baseUrl}/login/`, formData.toString(), {
          headers,
          withCredentials: true,
          observe: 'response'
        }).pipe(
          tap(response => {
            console.log('Login response:', {
              status: response.status,
              headers: response.headers.keys(),
              cookies: document.cookie
            });
            this.isAuthenticatedSubject.next(true);
          }),
          catchError(error => {
            console.error('Login request failed:', error);
            if (error.status === 403) {
              return throwError(() => new Error('Invalid CSRF token'));
            }
            return throwError(() => error);
          })
        );
      })
    );
  }

  logout(): Observable<any> {
    console.log('Logout requested');
    return this.http.post(`${this.baseUrl}/logout/`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        console.log('Logout successful');
        this.isAuthenticatedSubject.next(false);
      }),
      catchError(error => {
        console.error('Logout failed:', error);
        return throwError(() => error);
      })
    );
  }

  checkAuthStatus(): void {
    console.log('Checking auth status');
    this.http.get(`${this.baseUrl}/status/`, {
      withCredentials: true
    }).subscribe({
      next: () => {
        console.log('Auth check: authenticated');
        this.isAuthenticatedSubject.next(true);
      },
      error: (error) => {
        console.log('Auth check: not authenticated', error);
        this.isAuthenticatedSubject.next(false);
      }
    });
  }
}
