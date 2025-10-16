import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../models/user.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <div class="profile-page">
      <div class="profile-container">
        <h1>My Profile</h1>
        @if (user()) {
          <div class="profile-card">
            <div class="form-grid">
              <div class="form-field">
                <label>First Name</label>
                <input type="text" [(ngModel)]="editForm.firstName" class="form-input" />
              </div>
              <div class="form-field">
                <label>Last Name</label>
                <input type="text" [(ngModel)]="editForm.lastName" class="form-input" />
              </div>
              <div class="form-field">
                <label>Email</label>
                <input type="email" [(ngModel)]="editForm.email" class="form-input" />
              </div>
              <div class="form-field">
                <label>Phone</label>
                <input type="tel" [(ngModel)]="editForm.phone" class="form-input" />
              </div>
            </div>
            <div class="form-actions">
              <app-button (clicked)="saveProfile()">Save Changes</app-button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      min-height: 100vh;
      background: #f9fafb;
      padding: 2rem;
    }

    .profile-container {
      max-width: 800px;
      margin: 0 auto;
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 2rem;
    }

    .profile-card {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-field label {
      font-weight: 600;
      color: #374151;
    }

    .form-input {
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      font-size: 1rem;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  user = signal<User | null>(null);
  editForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  };

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user.set(currentUser);
      this.editForm = {
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        phone: currentUser.phone
      };
    }
  }

  saveProfile(): void {
    this.notificationService.success('Profile updated successfully');
  }
}
