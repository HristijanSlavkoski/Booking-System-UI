import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../models/booking.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  template: `
    <div class="my-bookings-page">
      <div class="bookings-container">
        <h1>My Bookings</h1>
        @if (loading()) {
          <app-loading message="Loading bookings..."></app-loading>
        } @else if (bookings().length > 0) {
          <div class="bookings-list">
            @for (booking of bookings(); track booking.id) {
              <div class="booking-card">
                <div class="booking-header">
                  <h3>{{ booking.gameName }}</h3>
                  <span class="status-badge" [class]="booking.status.toLowerCase()">{{ booking.status }}</span>
                </div>
                <div class="booking-details">
                  <p><strong>Date:</strong> {{ booking.bookingDate | date }}</p>
                  <p><strong>Time:</strong> {{ booking.bookingTime }}</p>
                  <p><strong>Players:</strong> {{ booking.playerCount }}</p>
                  <p><strong>Total:</strong> {{ booking.totalPrice }} {{ booking.currency }}</p>
                  <p><strong>Payment:</strong> {{ booking.paymentStatus }}</p>
                </div>
              </div>
            }
          </div>
        } @else {
          <p class="empty-message">No bookings found</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .my-bookings-page {
      min-height: 100vh;
      background: #f9fafb;
      padding: 2rem;
    }

    .bookings-container {
      max-width: 1000px;
      margin: 0 auto;
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 2rem;
    }

    .bookings-list {
      display: grid;
      gap: 1.5rem;
    }

    .booking-card {
      background: white;
      padding: 1.5rem;
      border-radius: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .booking-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .booking-header h3 {
      font-size: 1.5rem;
      margin: 0;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.confirmed {
      background: #d1fae5;
      color: #065f46;
    }

    .status-badge.pending {
      background: #fef3c7;
      color: #92400e;
    }

    .booking-details p {
      margin: 0.5rem 0;
      color: #6b7280;
    }

    .empty-message {
      text-align: center;
      color: #6b7280;
      padding: 4rem;
    }
  `]
})
export class MyBookingsComponent implements OnInit {
  private bookingService = inject(BookingService);

  bookings = signal<Booking[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading.set(true);
    this.bookingService.getUserBookings().subscribe({
      next: (bookings) => {
        this.bookings.set(bookings);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
