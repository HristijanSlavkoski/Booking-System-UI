import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { GameService } from './game.service';
import { Booking, BookingRequest, BookingResponse } from '../../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiService = inject(ApiService);
  private gameService = inject(GameService);

  getAllBookings(params?: any): Observable<Booking[]> {
    return this.apiService.get<Booking[]>('/bookings', params);
  }

  getBookingById(id: string): Observable<Booking> {
    return this.apiService.get<Booking>(`/bookings/${id}`);
  }

  getUserBookings(): Observable<Booking[]> {
    return this.apiService.get<Booking[]>('/bookings/my-bookings');
  }

  getBookingsByDate(date: string): Observable<Booking[]> {
    return this.apiService.get<Booking[]>('/bookings/by-date', { date });
  }

  createBooking(bookingRequest: BookingRequest): Observable<BookingResponse> {
    return this.apiService.post<BookingResponse>('/bookings', bookingRequest);
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

  checkAvailability(date: string, time: string, rooms: number): Observable<{available: boolean; availableSlots: number; requestedRooms: number}> {
    return this.apiService.get<{available: boolean; availableSlots: number; requestedRooms: number}>(
      '/bookings/availability',
      { date, time, rooms }
    );
  }
}
