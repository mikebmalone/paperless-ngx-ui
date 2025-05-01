import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url.includes('/accounts/login/')) {
      return next.handle(request);
    }

    let modifiedReq = request.clone({
      withCredentials: true,
      headers: request.headers
        .set('Accept', 'application/json')
        .set('X-Requested-With', 'XMLHttpRequest')
    });

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const csrfToken = this.authService.getCsrfToken();
      if (csrfToken) {
        modifiedReq = modifiedReq.clone({
          headers: modifiedReq.headers.set('X-CSRFToken', csrfToken)
        });
      }
    }

    return next.handle(modifiedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
