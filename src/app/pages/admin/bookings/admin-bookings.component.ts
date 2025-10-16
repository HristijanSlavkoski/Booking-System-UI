import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-bookings">
      <h1>Manage Bookings</h1>
      <p>Booking management interface will be displayed here.</p>
    </div>
  `,
  styles: [`
    .admin-bookings {
      padding: 2rem;
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
  `]
})
export class AdminBookingsComponent {}
