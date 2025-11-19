import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BookingService} from '../../../core/services/booking.service';
import {Booking} from '../../../models/booking.model';
import {TranslatePipe} from '@ngx-translate/core';
import {LoadingComponent} from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, TranslatePipe, LoadingComponent],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.scss']
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

  /** Prefer root gameName, fallback to first bookingGame.gameName */
  getGameName(b: Booking): string {
    const firstGame = b.bookingGames && b.bookingGames.length > 0 ? b.bookingGames[0] : null;
    return firstGame?.gameName || '—';
  }

  /** Prefer root playerCount, fallback to first bookingGame.playerCount */
  getPlayerCount(b: Booking): number | null {
    const firstGame = b.bookingGames && b.bookingGames.length > 0 ? b.bookingGames[0] : null;
    return typeof firstGame?.playerCount === 'number' ? firstGame.playerCount : null;
  }

  /** Currency helper with MKD fallback */
  getCurrency(b: Booking): string {
    return b.currency || 'MKD';
  }
}
