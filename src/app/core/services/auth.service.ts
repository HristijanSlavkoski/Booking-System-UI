import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { ApiService } from './api.service';
import { User, LoginRequest, RegisterRequest, AuthResponse, UserRole } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiService = inject(ApiService);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  public isAuthenticated = signal(false);
  public isAdmin = signal(false);

  constructor() {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/login', credentials).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/register', data).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
    this.isAdmin.set(false);
    this.router.navigate(['/']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  private handleAuthResponse(response: any): void {
    // Accept either our own AuthResponse shape or raw Keycloak token response
    const token =
        response?.token ??
        response?.access_token; // from Keycloak

    if (!token) throw new Error('No token in login response');

    const user =
        response?.user ?? {
          // Build a minimal user so the header can render
          email: this.extractEmailFromToken(token) ?? 'unknown@vrroom.com',
          role: this.extractRoleFromToken(token) ?? 'USER'
        };

    localStorage.setItem('auth_token', token);
    localStorage.setItem('current_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticated.set(true);
    this.isAdmin.set(user.role === 'ADMIN');
  }

// Very lightweight JWT parsing (no crypto, just reading payload)
  private extractEmailFromToken(jwt: string): string | null {
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1]));
      return payload?.email ?? payload?.preferred_username ?? null;
    } catch { return null; }
  }

  private extractRoleFromToken(jwt: string): 'ADMIN'|'USER' {
    try {
      const p = JSON.parse(atob(jwt.split('.')[1]));
      const realmRoles: string[] = p?.realm_access?.roles ?? [];
      const clientRoles: string[] = Object
          .values<any>(p?.resource_access ?? {})
          .flatMap((r: any) => r?.roles ?? []);
      const roles = new Set([...realmRoles, ...clientRoles].map(r => r.toUpperCase()));
      return roles.has('ADMIN') ? 'ADMIN' : 'USER';
    } catch { return 'USER'; }
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('current_user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this.currentUserSubject.next(user);
        this.isAuthenticated.set(true);
        this.isAdmin.set(user.role === UserRole.ADMIN);
      } catch (error) {
        console.error('Error loading user from storage:', error);
        this.logout();
      }
    }
  }
}
