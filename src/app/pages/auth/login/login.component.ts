import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {AuthService} from '../../../core/services/auth.service';
import {NotificationService} from '../../../core/services/notification.service';
import {ButtonComponent} from "../../../shared/components/button/button.component";

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ButtonComponent],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    private authService = inject(AuthService);
    private notificationService = inject(NotificationService);
    private router = inject(Router);

    loading = signal(false);

    credentials = {
        email: '',
        password: ''
    };

    isFormValid(): boolean {
        return !!(this.credentials.email && this.credentials.password);
    }

    login(): void {
        if (!this.isFormValid()) return;

        this.loading.set(true);
        this.authService.login(this.credentials).subscribe({
            next: () => {
                this.notificationService.success('Login successful!');
                this.router.navigate(['/']);
                this.loading.set(false);
            },
            error: () => {
                this.notificationService.error('Invalid email or password');
                this.loading.set(false);
            }
        });
    }
}
