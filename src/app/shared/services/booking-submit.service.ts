import {inject, Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Observable, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';

import {BookingService} from '../../core/services/booking.service';
import {NotificationService} from '../../core/services/notification.service';
import {BookingStore} from '../stores/booking.store';
import {buildBookingRequestFromStore} from '../utils/booking-request.util';
import {BookingRequest} from '../../models/booking.model';

@Injectable({providedIn: 'root'})
export class BookingSubmitService {
    private bookingApi = inject(BookingService);
    private notify = inject(NotificationService);
    private router = inject(Router);

    /**
     * Builds the request from the store and submits it.
     * Components own the loading flag; they just subscribe to this.
     */
    submitFromStore(store: BookingStore, opts?: { embedded?: boolean }): Observable<any> {
        const req = buildBookingRequestFromStore(store);
        return this.submit(req, opts);
    }

    /**
     * If you ever want to submit a custom-built request (e.g. tests),
     * you can use this overload directly.
     */
    submit(req: BookingRequest, opts?: { embedded?: boolean }): Observable<any> {
        return this.bookingApi.createBooking(req).pipe(
            tap((res: any) => {
                this.notify.success('Booking created successfully!');
                if (opts?.embedded) {
                    this.router.navigate(['/calendar']);
                } else {
                    this.router.navigate(['/my-bookings']);
                }
            }),
            catchError((err) => {
                console.error('Booking error:', err);
                this.notify.error('Failed to create booking: ' + (err?.error?.error || 'Unknown error'));
                return throwError(() => err);
            })
        );
    }
}
