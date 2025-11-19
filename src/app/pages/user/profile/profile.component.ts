import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../../../core/services/auth.service';
import {NotificationService} from '../../../core/services/notification.service';
import {User} from '../../../models/user.model';
import {TranslatePipe} from "@ngx-translate/core";
import {ButtonComponent} from "../../../shared/components/button/button.component";

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslatePipe, ButtonComponent],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
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

    initials(): string {
        const u = this.user();
        if (!u) return '?';
        const first = (u.firstName || '').charAt(0);
        const last = (u.lastName || '').charAt(0);
        return (first + last).toUpperCase() || '?';
    }

    saveProfile(): void {
        // later: call API, update authService, etc.
        this.notificationService.success('Profile updated successfully');
    }
}
