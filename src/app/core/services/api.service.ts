// src/app/core/services/api.service.ts
import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private http = inject(HttpClient);

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
        return this.http.get<T>(url, options);
    }

    post<T>(url: string, body: any): Observable<T> {
        return this.http.post<T>(url, body, {headers: this.getAuthHeaders()});
    }

    put<T>(url: string, body: any): Observable<T> {
        return this.http.put<T>(url, body, {headers: this.getAuthHeaders()});
    }

    delete<T>(url: string): Observable<T> {
        return this.http.delete<T>(url, {headers: this.getAuthHeaders()});
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
}
