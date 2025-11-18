import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {AdminService} from '../../../core/services/admin.service';
import {BookingService} from '../../../core/services/booking.service';
import {Booking} from '../../../models/booking.model';
import {ButtonComponent} from '../../../shared/components/button/button.component';
import {LoadingComponent} from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, LoadingComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private bookingService = inject(BookingService);

  loading = signal(false);
  stats = signal({
    todayBookings: 0,
    confirmedBookings: 0,
    todayRevenue: 0,
    occupancyRate: 0
  });
  todayBookings = signal<Booking[]>([]);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading.set(true);
    const today = new Date().toISOString().split('T')[0];

    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });

    this.bookingService.getBookingsByDate(today).subscribe({
      next: (bookings) => {
        this.todayBookings.set(bookings);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.loading.set(false);
      }
    });
  }
}
