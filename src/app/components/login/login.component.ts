import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h2>Login to Document Management</h2>
        </div>
        
        <div class="login-content">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="form-field">
              <label for="username">Username</label>
              <input 
                id="username"
                type="text" 
                formControlName="username" 
                [class.error]="loginForm.get('username')?.errors?.['required'] && loginForm.get('username')?.touched"
              >
              <div class="error-message" *ngIf="loginForm.get('username')?.errors?.['required'] && loginForm.get('username')?.touched">
                Username is required
              </div>
            </div>

            <div class="form-field">
              <label for="password">Password</label>
              <input 
                id="password"
                type="password" 
                formControlName="password"
                [class.error]="loginForm.get('password')?.errors?.['required'] && loginForm.get('password')?.touched"
              >
              <div class="error-message" *ngIf="loginForm.get('password')?.errors?.['required'] && loginForm.get('password')?.touched">
                Password is required
              </div>
            </div>

            <div *ngIf="errorMessage" class="error-container">
              {{ errorMessage }}
            </div>

            <button 
              type="submit" 
              class="submit-button"
              [disabled]="isLoading || loginForm.invalid"
            >
              <span *ngIf="!isLoading">Login</span>
              <span *ngIf="isLoading">Logging in...</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 64px);
      padding: 20px;
      background-color: #f5f5f5;
    }

    .login-card {
      max-width: 400px;
      width: 100%;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 24px;
    }

    .login-header {
      margin-bottom: 24px;
      text-align: center;
    }

    .login-header h2 {
      margin: 0;
      color: rgba(0, 0, 0, 0.87);
    }

    .form-field {
      margin-bottom: 16px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      color: rgba(0, 0, 0, 0.87);
    }

    input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 16px;
    }

    input.error {
      border-color: #f44336;
    }

    .error-message {
      color: #f44336;
      font-size: 12px;
      margin-top: 4px;
    }

    .error-container {
      color: #f44336;
      background-color: #ffebee;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .submit-button {
      width: 100%;
      padding: 12px;
      background-color: #1976d2;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
    }

    .submit-button:hover {
      background-color: #1565c0;
    }

    .submit-button:disabled {
      background-color: rgba(0, 0, 0, 0.12);
      cursor: not-allowed;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    // If already authenticated, redirect to documents
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate(['/documents']);
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    const { username, password } = this.loginForm.value;
    
    this.authService.login(username, password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/documents']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Failed to login. Please check your credentials.';
        console.error('Login error:', error);
      }
    });
  }
}
