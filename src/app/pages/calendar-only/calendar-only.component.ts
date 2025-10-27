import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CalendarComponent, SlotSelection } from '../../shared/components/calendar/calendar.component';
import { ConfigService } from '../../core/services/config.service';

@Component({
  selector: 'app-calendar-only',
  standalone: true,
  imports: [CommonModule, CalendarComponent],
  template: `
    <div class="calendar-only-page">
      <div class="calendar-header">
        <h1 class="title">Select Your Date & Time</h1>
        <p class="subtitle">Choose an available slot to continue booking</p>
      </div>

      <app-calendar
        [maxConcurrentBookings]="maxConcurrentBookings()"
        (slotSelected)="onSlotSelected($event)">
      </app-calendar>
    </div>
  `,
  styles: [`
    .calendar-only-page {
      min-height: 100vh;
      background: #0a0a0a;
      padding: 2rem;
    }

    .calendar-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .title {
      font-size: 2.5rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 0.5rem 0;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .subtitle {
      font-size: 1.125rem;
      color: #aaa;
      margin: 0;
    }

    @media (max-width: 768px) {
      .calendar-only-page {
        padding: 1rem;
      }

      .title {
        font-size: 1.75rem;
      }

      .subtitle {
        font-size: 1rem;
      }
    }
  `]
})
export class CalendarOnlyComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private configService = inject(ConfigService);

  maxConcurrentBookings = signal(2);

  ngOnInit(): void {
    this.loadConfig();
  }

  loadConfig(): void {
    this.configService.loadConfig().subscribe({
      next: (config) => {
        this.maxConcurrentBookings.set(config.maxConcurrentBookings);
      }
    });
  }

  onSlotSelected(slot: SlotSelection): void {
    const gameId = this.route.snapshot.queryParamMap.get('gameId');

    const queryParams: any = {
      date: slot.date,
      time: slot.time,
      rooms: slot.rooms
    };

    if (gameId) {
      queryParams.gameId = gameId;
    }

    this.router.navigate(['/booking'], { queryParams });
  }
}
