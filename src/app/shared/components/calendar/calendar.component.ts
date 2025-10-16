import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TimeSlotAvailability {
  time: string;
  status: 'available' | 'booked' | 'reserved' | 'unavailable';
  availableSpots: number;
  maxSpots: number;
}

export interface DaySchedule {
  date: Date;
  dateString: string;
  dayName: string;
  slots: TimeSlotAvailability[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="calendar-container">
      <div class="calendar-header">
        <button class="nav-btn" (click)="previousWeek()" [disabled]="!canGoPrevious()">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        </button>
        <h3 class="calendar-title">{{ getWeekRange() }}</h3>
        <button class="nav-btn" (click)="nextWeek()">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>

      <div class="legend">
        <div class="legend-item">
          <span class="legend-dot available"></span>
          <span>Available</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot reserved"></span>
          <span>Reserved (Being Booked)</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot booked"></span>
          <span>Booked</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot unavailable"></span>
          <span>Unavailable</span>
        </div>
      </div>

      <div class="schedule-grid">
        <div class="time-column">
          <div class="header-cell">Time</div>
          @for (time of timeSlots(); track time) {
            <div class="time-cell">{{ time }}</div>
          }
        </div>

        @for (day of weekSchedule(); track day.dateString) {
          <div class="day-column">
            <div class="header-cell">
              <div class="day-name">{{ day.dayName }}</div>
              <div class="day-date">{{ formatDate(day.date) }}</div>
            </div>
            @for (slot of day.slots; track slot.time) {
              <div
                class="slot-cell"
                [class.available]="slot.status === 'available'"
                [class.booked]="slot.status === 'booked'"
                [class.reserved]="slot.status === 'reserved'"
                [class.unavailable]="slot.status === 'unavailable'"
                [class.selected]="isSelected(day.dateString, slot.time)"
                (click)="selectSlot(day.dateString, slot.time, slot.status)">
                <div class="slot-content">
                  @if (slot.status === 'available') {
                    <span class="spots">{{ slot.availableSpots }}/{{ slot.maxSpots }}</span>
                  }
                  @if (slot.status === 'booked') {
                    <span class="status-text">Full</span>
                  }
                  @if (slot.status === 'reserved') {
                    <span class="status-text">Hold</span>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>

      @if (selectedSlot()) {
        <div class="selection-summary">
          <div class="summary-content">
            <div class="summary-icon">✓</div>
            <div class="summary-text">
              <strong>Selected:</strong> {{ formatSelectedDate() }} at {{ selectedSlot()!.time }}
            </div>
            <button class="confirm-btn" (click)="confirmSelection()">
              Continue to Booking
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .calendar-container {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .calendar-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .nav-btn {
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 0.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #374151;
    }

    .nav-btn:hover:not(:disabled) {
      border-color: #667eea;
      color: #667eea;
    }

    .nav-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .legend {
      display: flex;
      gap: 2rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .legend-dot {
      width: 1rem;
      height: 1rem;
      border-radius: 0.25rem;
    }

    .legend-dot.available {
      background: #10b981;
    }

    .legend-dot.reserved {
      background: #f59e0b;
    }

    .legend-dot.booked {
      background: #ef4444;
    }

    .legend-dot.unavailable {
      background: #9ca3af;
    }

    .schedule-grid {
      display: grid;
      grid-template-columns: 100px repeat(7, 1fr);
      gap: 1px;
      background: #e5e7eb;
      border-radius: 0.5rem;
      overflow: hidden;
      margin-bottom: 2rem;
    }

    .time-column,
    .day-column {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .header-cell {
      background: #f9fafb;
      padding: 1rem;
      font-weight: 600;
      color: #111827;
      text-align: center;
      min-height: 70px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .day-name {
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }

    .day-date {
      font-size: 0.75rem;
      color: #6b7280;
      font-weight: 400;
    }

    .time-cell {
      background: #f9fafb;
      padding: 1rem 0.5rem;
      font-size: 0.75rem;
      color: #6b7280;
      text-align: center;
      min-height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .slot-cell {
      background: white;
      min-height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .slot-cell.available {
      background: #d1fae5;
      border: 2px solid transparent;
    }

    .slot-cell.available:hover {
      background: #a7f3d0;
      transform: scale(1.05);
      z-index: 1;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .slot-cell.booked {
      background: #fee2e2;
      cursor: not-allowed;
    }

    .slot-cell.reserved {
      background: #fef3c7;
      cursor: not-allowed;
    }

    .slot-cell.unavailable {
      background: #f3f4f6;
      cursor: not-allowed;
    }

    .slot-cell.selected {
      background: #667eea !important;
      border: 3px solid #764ba2 !important;
      transform: scale(1.05);
      z-index: 2;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .slot-cell.selected .slot-content {
      color: white;
      font-weight: 700;
    }

    .slot-content {
      font-size: 0.75rem;
      text-align: center;
    }

    .spots {
      color: #065f46;
      font-weight: 600;
    }

    .status-text {
      color: #6b7280;
      font-size: 0.7rem;
      text-transform: uppercase;
      font-weight: 600;
    }

    .selection-summary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .summary-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .summary-icon {
      width: 3rem;
      height: 3rem;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .summary-text {
      flex: 1;
      font-size: 1.125rem;
    }

    .confirm-btn {
      background: white;
      color: #667eea;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .confirm-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 1200px) {
      .schedule-grid {
        overflow-x: auto;
      }
    }

    @media (max-width: 768px) {
      .calendar-container {
        padding: 1rem;
      }

      .schedule-grid {
        grid-template-columns: 80px repeat(7, 120px);
      }

      .legend {
        gap: 1rem;
      }

      .summary-content {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class CalendarComponent implements OnInit {
  @Input() gameId: string = '';
  @Input() maxConcurrentBookings: number = 2;
  @Output() slotSelected = new EventEmitter<{ date: string; time: string }>();

  weekSchedule = signal<DaySchedule[]>([]);
  timeSlots = signal<string[]>([]);
  selectedSlot = signal<{ date: string; time: string } | null>(null);
  currentWeekStart = new Date();

  ngOnInit(): void {
    this.setToStartOfWeek(this.currentWeekStart);
    this.generateTimeSlots();
    this.loadWeekSchedule();
  }

  generateTimeSlots(): void {
    const slots: string[] = [];
    for (let hour = 9; hour <= 21; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    this.timeSlots.set(slots);
  }

  loadWeekSchedule(): void {
    const schedule: DaySchedule[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(this.currentWeekStart);
      date.setDate(date.getDate() + i);

      const daySchedule: DaySchedule = {
        date: date,
        dateString: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        slots: this.timeSlots().map(time => this.getSlotAvailability(date, time, today))
      };

      schedule.push(daySchedule);
    }

    this.weekSchedule.set(schedule);
  }

  getSlotAvailability(date: Date, time: string, today: Date): TimeSlotAvailability {
    const isPast = date < today || (date.getTime() === today.getTime() && this.isTimePast(time));

    if (isPast) {
      return {
        time,
        status: 'unavailable',
        availableSpots: 0,
        maxSpots: this.maxConcurrentBookings
      };
    }

    const bookedCount = Math.floor(Math.random() * (this.maxConcurrentBookings + 1));

    if (bookedCount >= this.maxConcurrentBookings) {
      return {
        time,
        status: 'booked',
        availableSpots: 0,
        maxSpots: this.maxConcurrentBookings
      };
    }

    const isReserved = Math.random() < 0.15 && bookedCount < this.maxConcurrentBookings - 1;

    if (isReserved) {
      return {
        time,
        status: 'reserved',
        availableSpots: this.maxConcurrentBookings - bookedCount - 1,
        maxSpots: this.maxConcurrentBookings
      };
    }

    return {
      time,
      status: 'available',
      availableSpots: this.maxConcurrentBookings - bookedCount,
      maxSpots: this.maxConcurrentBookings
    };
  }

  isTimePast(time: string): boolean {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);
    return slotTime < now;
  }

  selectSlot(date: string, time: string, status: string): void {
    if (status === 'available') {
      this.selectedSlot.set({ date, time });
    }
  }

  isSelected(date: string, time: string): boolean {
    const selected = this.selectedSlot();
    return selected?.date === date && selected?.time === time;
  }

  confirmSelection(): void {
    const selected = this.selectedSlot();
    if (selected) {
      this.slotSelected.emit(selected);
    }
  }

  previousWeek(): void {
    if (this.canGoPrevious()) {
      this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
      this.loadWeekSchedule();
      this.selectedSlot.set(null);
    }
  }

  nextWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.loadWeekSchedule();
    this.selectedSlot.set(null);
  }

  canGoPrevious(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(this.currentWeekStart);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart > today;
  }

  getWeekRange(): string {
    const start = new Date(this.currentWeekStart);
    const end = new Date(this.currentWeekStart);
    end.setDate(end.getDate() + 6);

    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return `${startStr} - ${endStr}`;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
  }

  formatSelectedDate(): string {
    const selected = this.selectedSlot();
    if (!selected) return '';

    const date = new Date(selected.date);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  setToStartOfWeek(date: Date): void {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
  }
}
