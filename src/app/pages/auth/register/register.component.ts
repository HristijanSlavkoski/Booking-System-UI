import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RegisterRequest } from '../../../models/user.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonComponent],
  template: `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <h1>Create Account</h1>
            <p>Sign up to get started</p>
          </div>

          <form (ngSubmit)="register()" class="auth-form">
            <div class="form-row">
              <div class="form-field">
                <label>First Name</label>
                <input type="text" [(ngModel)]="formData.firstName" name="firstName" required class="form-input" />
              </div>
              <div class="form-field">
                <label>Last Name</label>
                <input type="text" [(ngModel)]="formData.lastName" name="lastName" required class="form-input" />
              </div>
            </div>

            <div class="form-field">
              <label>Email</label>
              <input type="email" [(ngModel)]="formData.email" name="email" required class="form-input" />
            </div>

            <div class="form-field">
              <label>Phone</label>
              <input type="tel" [(ngModel)]="formData.phone" name="phone" required class="form-input" />
            </div>

            <div class="form-field">
              <label>Password</label>
              <input type="password" [(ngModel)]="formData.password" name="password" required class="form-input" />
            </div>

            <app-button type="submit" [fullWidth]="true" [loading]="loading()" [disabled]="!isFormValid()">
              Create Account
            </app-button>
          </form>

          <div class="auth-footer">
            <p>Already have an account? <a routerLink="/login">Sign in</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .auth-container {
      width: 100%;
      max-width: 450px;
    }

    .auth-card {
      background: white;
      border-radius: 1rem;
      padding: 3rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-header h1 {
      font-size: 2rem;
      font-weight: 800;
      color: #111827;
      margin: 0 0 0.5rem 0;
    }

    .auth-header p {
      color: #6b7280;
      margin: 0;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-field label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem;
      font-size: 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      transition: border-color 0.3s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .auth-footer {
      margin-top: 2rem;
      text-align: center;
    }

    .auth-footer p {
      color: #6b7280;
      font-size: 0.875rem;
      margin: 0;
    }

    .auth-footer a {
      color: #667eea;
      font-weight: 600;
      text-decoration: none;
    }

    .auth-footer a:hover {
      color: #764ba2;
    }

    @media (max-width: 768px) {
      .auth-card {
        padding: 2rem;
      }

      .auth-header h1 {
        font-size: 1.5rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  loading = signal(false);

  formData: RegisterRequest = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  };

  isFormValid(): boolean {
    return !!(
      this.formData.email &&
      this.formData.password &&
      this.formData.firstName &&
      this.formData.lastName &&
      this.formData.phone
    );
  }

  register(): void {
    if (!this.isFormValid()) return;

    this.loading.set(true);
    this.authService.register(this.formData).subscribe({
      next: () => {
        this.notificationService.success('Account created successfully!');
        this.router.navigate(['/']);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.error('Failed to create account');
        this.loading.set(false);
      }
    });
  }
}
