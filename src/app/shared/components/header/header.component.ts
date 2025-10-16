import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageSwitcherComponent, TranslatePipe],
  template: `
    <header class="header">
      <div class="header-container">
        <div class="header-logo" (click)="navigateHome()">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="url(#gradient)"/>
            <path d="M20 10L12 18H28L20 10Z" fill="white"/>
            <rect x="14" y="18" width="12" height="12" fill="white" opacity="0.8"/>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40">
                <stop offset="0%" stop-color="#667eea"/>
                <stop offset="100%" stop-color="#764ba2"/>
              </linearGradient>
            </defs>
          </svg>
          <span class="logo-text">VR Escape</span>
        </div>

        <button class="mobile-menu-btn" (click)="toggleMobileMenu()" aria-label="Menu">
          <svg *ngIf="!mobileMenuOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
          <svg *ngIf="mobileMenuOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <nav class="nav-links" [class.mobile-open]="mobileMenuOpen">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMobileMenu()">{{ 'nav.home' | translate }}</a>
          <a routerLink="/games" routerLinkActive="active" (click)="closeMobileMenu()">{{ 'nav.games' | translate }}</a>
          <a routerLink="/booking" routerLinkActive="active" (click)="closeMobileMenu()">{{ 'nav.booking' | translate }}</a>

          @if (authService.isAuthenticated()) {
            @if (authService.isAdmin()) {
              <a routerLink="/admin" routerLinkActive="active" (click)="closeMobileMenu()">{{ 'nav.admin' | translate }}</a>
            }
            <a routerLink="/profile" routerLinkActive="active" (click)="closeMobileMenu()">{{ 'nav.profile' | translate }}</a>
            <button class="logout-btn" (click)="logout()">{{ 'nav.logout' | translate }}</button>
          } @else {
            <a routerLink="/login" routerLinkActive="active" class="login-link" (click)="closeMobileMenu()">{{ 'nav.login' | translate }}</a>
          }

          <app-language-switcher></app-language-switcher>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .header-logo:hover {
      transform: scale(1.05);
    }

    .logo-text {
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .mobile-menu-btn {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      color: #374151;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .nav-links a {
      text-decoration: none;
      color: #374151;
      font-weight: 500;
      transition: color 0.3s ease;
      position: relative;
    }

    .nav-links a:hover {
      color: #667eea;
    }

    .nav-links a.active::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      right: 0;
      height: 2px;
      background: #667eea;
    }

    .login-link {
      padding: 0.5rem 1.5rem;
      border: 2px solid #667eea;
      border-radius: 0.5rem;
      color: #667eea;
      transition: all 0.3s ease;
    }

    .login-link:hover {
      background: #667eea;
      color: white;
    }

    .logout-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .logout-btn:hover {
      background: #c82333;
    }

    @media (max-width: 768px) {
      .mobile-menu-btn {
        display: block;
      }

      .nav-links {
        position: fixed;
        top: 73px;
        left: 0;
        right: 0;
        background: white;
        flex-direction: column;
        padding: 2rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transform: translateY(-100%);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }

      .nav-links.mobile-open {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
      }

      .nav-links a {
        width: 100%;
        text-align: center;
        padding: 0.75rem;
      }

      .logout-btn {
        width: 100%;
      }
    }
  `]
})
export class HeaderComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  mobileMenuOpen = false;

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
}
