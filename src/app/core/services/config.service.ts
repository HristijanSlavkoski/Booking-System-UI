import { Injectable, inject } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { SystemConfig } from '../../models/config.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private apiService = inject(ApiService);

  private configSubject = new BehaviorSubject<SystemConfig | null>(null);
  public config$ = this.configSubject.asObservable();

  loadConfig(): Observable<SystemConfig> {
    if (environment.useBackendConfig) {
      return this.apiService.get<SystemConfig>('/config').pipe(
        tap(config => this.configSubject.next(config)),
        catchError(() => {
          console.warn('Failed to load config from backend, using local config');
          const localConfig = this.getLocalConfig();
          this.configSubject.next(localConfig);
          return of(localConfig);
        })
      );
    } else {
      const localConfig = this.getLocalConfig();
      this.configSubject.next(localConfig);
      return of(localConfig);
    }
  }

  getConfig(): SystemConfig | null {
    return this.configSubject.value;
  }

  getMaxConcurrentBookings(): number {
    return this.configSubject.value?.maxConcurrentBookings || environment.localConfig.maxConcurrentBookings;
  }

  getBookingSlotDuration(): number {
    return this.configSubject.value?.bookingSlotDuration || environment.localConfig.bookingSlotDuration;
  }

  private getLocalConfig(): SystemConfig {
    return {
      maxConcurrentBookings: environment.localConfig.maxConcurrentBookings,
      bookingSlotDuration: environment.localConfig.bookingSlotDuration,
      minBookingNotice: environment.localConfig.minBookingNotice,
      maxBookingAdvance: environment.localConfig.maxBookingAdvance,
      businessHours: environment.localConfig.businessHours,
      holidays: [],
      blockedDates: []
    };
  }
}
