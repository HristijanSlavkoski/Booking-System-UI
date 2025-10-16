import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-schedule',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-schedule">
      <h1>Schedule View</h1>
      <p>Daily schedule and booking timeline will be displayed here.</p>
    </div>
  `,
  styles: [`
    .admin-schedule {
      padding: 2rem;
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
  `]
})
export class AdminScheduleComponent {}
