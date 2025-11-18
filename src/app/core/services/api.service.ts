import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, timeout} from 'rxjs/operators';
import {environment} from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiUrl;

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('auth_token');
        if (token) {
            return new HttpHeaders({
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            });
        }
        return new HttpHeaders({
            'Content-Type': 'application/json'
        });
    }

    get<T>(url: string, params?: any): Observable<T> {
        const options = {
            headers: this.getAuthHeaders(),
            params: this.createParams(params)
        };
        return this.http.get<T>(`${this.baseUrl}${url}`, options).pipe(
            timeout(environment.apiTimeout || 30000),
            catchError(this.handleError)
        );
    }

    post<T>(url: string, body: any): Observable<T> {
        return this.http.post<T>(`${this.baseUrl}${url}`, body, {
            headers: this.getAuthHeaders()
        }).pipe(
            timeout(environment.apiTimeout || 30000),
            catchError(this.handleError)
        );
    }

    put<T>(url: string, body: any): Observable<T> {
        return this.http.put<T>(`${this.baseUrl}${url}`, body, {
            headers: this.getAuthHeaders()
        }).pipe(
            timeout(environment.apiTimeout || 30000),
            catchError(this.handleError)
        );
    }

    delete<T>(url: string): Observable<T> {
        return this.http.delete<T>(`${this.baseUrl}${url}`, {
            headers: this.getAuthHeaders()
        }).pipe(
            timeout(environment.apiTimeout || 30000),
            catchError(this.handleError)
        );
    }

    private createParams(params: any): HttpParams {
        let httpParams = new HttpParams();
        if (params) {
            Object.keys(params).forEach(key => {
                if (params[key] !== null && params[key] !== undefined) {
                    httpParams = httpParams.set(key, params[key].toString());
                }
            });
        }
        return httpParams;
    }

    private handleError(error: any) {
        console.error('API Error:', error);

        // Handle specific error cases
        if (error.status === 401) {
            // Unauthorized - redirect to login or clear token
            localStorage.removeItem('auth_token');
            localStorage.removeItem('current_user');
            window.location.href = '/login';
        }

        return throwError(() => error);
    }
}
