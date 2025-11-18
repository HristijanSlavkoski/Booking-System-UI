// src/app/shared/components/header/header.component.ts
import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {AuthService} from '../../../core/services/auth.service';
import {LanguageSwitcherComponent} from '../language-switcher/language-switcher.component';
import {Subscription} from "rxjs";

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterModule, LanguageSwitcherComponent, TranslateModule],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
    authService = inject(AuthService);
    private router = inject(Router);

    mobileMenuOpen = false;
    currentUser: any = null;
    private userSubscription!: Subscription;

    ngOnInit(): void {
        this.userSubscription = this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
        });
    }

    ngOnDestroy(): void {
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
    }

    navigateHome(): void {
        this.router.navigate(['/']);
        this.closeMobileMenu();
    }

    logout(): void {
        this.authService.logout();
        this.closeMobileMenu();
    }

    toggleMobileMenu(): void {
        this.mobileMenuOpen = !this.mobileMenuOpen;
    }

    closeMobileMenu(): void {
        this.mobileMenuOpen = false;
    }

    // Helper method to check if user has admin role
    isAdmin(): boolean {
        return this.authService.isAdmin();
    }

    // Helper method to get user's full name
    getUserFullName(): string {
        return this.currentUser ? `${this.currentUser.firstName} ${this.currentUser.lastName}` : '';
    }
}
