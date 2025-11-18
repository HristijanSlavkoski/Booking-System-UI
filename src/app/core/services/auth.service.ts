// src/app/core/services/auth.service.ts
import {inject, Injectable, signal} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import {ApiService} from './api.service';
import {AuthResponse, LoginRequest, RegisterRequest, User} from '../../models/user.model';

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

    hasRole(role: string): boolean {
        const user = this.getCurrentUser();
        return user?.roles?.includes(role) || false;
    }

    private handleAuthResponse(response: any): void {
        const token = response?.token;

        if (!token) {
            throw new Error('No token in login response');
        }

        // Our backend now returns user data in the response
        const user = response?.user;

        if (!user) {
            throw new Error('No user data in login response');
        }

        localStorage.setItem('auth_token', token);
        localStorage.setItem('current_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.isAuthenticated.set(true);
        this.isAdmin.set(user.roles?.includes('ADMIN') || false);
    }

    private loadUserFromStorage(): void {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('current_user');

        if (token && userStr) {
            try {
                const user = JSON.parse(userStr) as User;
                this.currentUserSubject.next(user);
                this.isAuthenticated.set(true);
                this.isAdmin.set(user.roles?.includes('ADMIN') || false);
            } catch (error) {
                console.error('Error loading user from storage:', error);
                this.logout();
            }
        }
    }
}
