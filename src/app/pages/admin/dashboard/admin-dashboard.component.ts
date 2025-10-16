import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../models/booking.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, LoadingComponent],
  template: `
    <div class="admin-dashboard">
      <div class="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your VR escape room business</p>
      </div>

      @if (loading()) {
        <app-loading message="Loading dashboard..."></app-loading>
      } @else {
        <div class="dashboard-grid">
          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-content">
              <div class="stat-label">Today's Bookings</div>
              <div class="stat-value">{{ stats().todayBookings }}</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-label">Confirmed</div>
              <div class="stat-value">{{ stats().confirmedBookings }}</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
              <div class="stat-label">Today's Revenue</div>
              <div class="stat-value">{{ stats().todayRevenue }} MKD</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <div class="stat-label">Occupancy Rate</div>
              <div class="stat-value">{{ stats().occupancyRate }}%</div>
            </div>
          </div>
        </div>

        <div class="dashboard-actions">
          <h2>Quick Actions</h2>
          <div class="actions-grid">
            <app-button routerLink="/admin/schedule" variant="primary">
              📅 View Schedule
            </app-button>
            <app-button routerLink="/admin/bookings" variant="secondary">
              📋 Manage Bookings
            </app-button>
            <app-button routerLink="/admin/games" variant="secondary">
              🎮 Manage Games
            </app-button>
            <app-button routerLink="/admin/config" variant="secondary">
              ⚙️ Settings
            </app-button>
          </div>
        </div>

        <div class="recent-bookings">
          <h2>Recent Bookings</h2>
          @if (todayBookings().length > 0) {
            <div class="bookings-table">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Customer</th>
                    <th>Game</th>
                    <th>Players</th>
                    <th>Status</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  @for (booking of todayBookings(); track booking.id) {
                    <tr>
                      <td>{{ booking.bookingTime }}</td>
                      <td>{{ booking.customerInfo.firstName }} {{ booking.customerInfo.lastName }}</td>
                      <td>{{ booking.gameName }}</td>
                      <td>{{ booking.playerCount }}</td>
                      <td><span class="status-badge" [class]="booking.status.toLowerCase()">{{ booking.status }}</span></td>
                      <td><span class="payment-badge" [class]="booking.paymentStatus.toLowerCase()">{{ booking.paymentStatus }}</span></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <p class="empty-message">No bookings for today</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      font-size: 2.5rem;
      font-weight: 800;
      color: #111827;
      margin: 0 0 0.5rem 0;
    }

    .dashboard-header p {
      color: #6b7280;
      font-size: 1.125rem;
      margin: 0;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      font-size: 3rem;
    }

    .stat-content {
      flex: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.25rem;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #111827;
    }

    .dashboard-actions,
    .recent-bookings {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .dashboard-actions h2,
    .recent-bookings h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
      margin: 0 0 1.5rem 0;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .bookings-table {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: #f9fafb;
    }

    th, td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }

    th {
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
    }

    td {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .status-badge,
    .payment-badge {
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

    .status-badge.cancelled {
      background: #fee2e2;
      color: #991b1b;
    }

    .payment-badge.paid {
      background: #d1fae5;
      color: #065f46;
    }

    .payment-badge.pending {
      background: #fef3c7;
      color: #92400e;
    }

    .empty-message {
      text-align: center;
      color: #6b7280;
      padding: 2rem;
    }

    @media (max-width: 768px) {
      .dashboard-header h1 {
        font-size: 1.75rem;
      }

      .dashboard-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
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
