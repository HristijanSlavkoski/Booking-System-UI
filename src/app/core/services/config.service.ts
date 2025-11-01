import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {ApiService} from './api.service';
import {SystemConfig} from '../../models/config.model';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    private apiService = inject(ApiService);

    private configSubject = new BehaviorSubject<SystemConfig | null>(null);

    loadConfig(): Observable<SystemConfig> {
        return this.apiService.get<SystemConfig>('/config').pipe(
            tap(config => this.configSubject.next(config)),
            catchError((error) => {
                console.error('[ConfigService] Failed to load /config', error);
                this.configSubject.next(null);
                return throwError(() => error);
            })
        );
    }
}
