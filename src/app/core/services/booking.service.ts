import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { MockDataService } from './mock-data.service';
import { GameService } from './game.service';
import { Booking, BookingRequest, BookingResponse } from '../../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiService = inject(ApiService);
  private mockDataService = inject(MockDataService);
  private gameService = inject(GameService);

  getAllBookings(params?: any): Observable<Booking[]> {
    return this.apiService.get<Booking[]>('/bookings', params);
  }

  getBookingById(id: string): Observable<Booking> {
    return this.apiService.get<Booking>(`/bookings/${id}`);
  }

  getUserBookings(): Observable<Booking[]> {
    return this.apiService.get<Booking[]>('/bookings/my-bookings').pipe(
      catchError(() => of(this.mockDataService.getBookings()))
    );
  }

  getBookingsByDate(date: string): Observable<Booking[]> {
    return this.apiService.get<Booking[]>('/bookings/by-date', { date }).pipe(
      catchError(() => of(this.mockDataService.getBookingsByDate(date)))
    );
  }

  createBooking(bookingRequest: BookingRequest): Observable<BookingResponse> {
    return this.apiService.post<BookingResponse>('/bookings', bookingRequest).pipe(
      catchError(() => {
        const game = this.mockDataService.getGameById(bookingRequest.gameId);
        const pricing = this.mockDataService.getGamePricing(bookingRequest.gameId);
        const price = pricing.find(p => p.playerCount === bookingRequest.playerCount);

        const booking = this.mockDataService.createBooking({
          ...bookingRequest,
          bookingDate: new Date(bookingRequest.bookingDate),
          totalPrice: price?.price || 0,
          currency: 'MKD'
        });

        return of({
          booking,
          paymentUrl: bookingRequest.paymentMethod === 'ONLINE' ? 'https://payment.mock/checkout' : undefined
        });
      })
    );
  }

  cancelBooking(id: string, reason?: string): Observable<Booking> {
    return this.apiService.put<Booking>(`/bookings/${id}/cancel`, { reason });
  }

  updateBookingStatus(id: string, status: string): Observable<Booking> {
    return this.apiService.put<Booking>(`/bookings/${id}/status`, { status });
  }

  getAvailableSlots(date: string): Observable<any> {
    return this.apiService.get<any>('/bookings/available-slots', { date });
  }
}
