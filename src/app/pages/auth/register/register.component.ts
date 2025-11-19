import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {AuthService} from '../../../core/services/auth.service';
import {NotificationService} from '../../../core/services/notification.service';
import {RegisterRequest} from '../../../models/user.model';
import {ButtonComponent} from '../../../shared/components/button/button.component';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ButtonComponent],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
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
