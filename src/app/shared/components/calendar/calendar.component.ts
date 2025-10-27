import { Component, Input, Output, EventEmitter, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../button/button.component';
import { BookingService } from '../../../core/services/booking.service';

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

export interface SlotSelection {
  date: string;
  time: string;
  rooms: number;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent],
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

      <div class="schedule-grid" [style.opacity]="loading() ? 0.6 : 1">
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
                (click)="openSlotModal(day.dateString, slot.time, slot)">
                <div class="slot-content">
                  @if (slot.status === 'available') {
                    <div class="slot-available">
                      <span class="available-label">Available</span>
                      <span class="spots">{{ slot.availableSpots }}/{{ slot.maxSpots }}</span>
                    </div>
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

      @if (loading()) {
        <div style="text-align:center; margin-top: .5rem; color:#6b7280; font-size:.9rem;">
          Loading availability…
        </div>
      }

      @if (selectedSlot()) {
        <div class="selection-summary">
          <div class="summary-content">
            <div class="summary-icon">✓</div>
            <div class="summary-text">
              <strong>Selected:</strong> {{ formatSelectedDate() }} at {{ selectedSlot()!.time }}
              <span class="rooms-badge">{{ selectedSlot()!.rooms }} {{ selectedSlot()!.rooms === 1 ? 'Room' : 'Rooms' }}</span>
            </div>
            <button class="confirm-btn" (click)="confirmSelection()">
              Continue to Game Selection
            </button>
          </div>
        </div>
      }
    </div>

    <app-modal [isOpen]="showRoomModal()" [title]="'Select Number of Rooms'" (closed)="closeModal()">
      <div class="room-selection">
        <p class="modal-description">
          How many rooms would you like to book for <strong>{{ modalSlot()?.time }}</strong> on <strong>{{ formatModalDate() }}</strong>?
        </p>

        <div class="available-info">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" class="info-icon">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          <span>{{ modalSlot()?.availableSpots }} out of {{ modalSlot()?.maxSpots }} rooms available</span>
        </div>

        <div class="room-options">
          @for (num of getRoomOptions(); track num) {
            <div
              class="room-option"
              [class.selected]="selectedRooms() === num"
              (click)="selectRooms(num)">
              <div class="room-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
                @if (num > 1) {
                  <div class="room-count-badge">{{ num }}</div>
                }
              </div>
              <div class="room-label">{{ num }} {{ num === 1 ? 'Room' : 'Rooms' }}</div>
              @if (selectedRooms() === num) {
                <div class="check-icon">✓</div>
              }
            </div>
          }
        </div>
      </div>

      <div footer class="modal-actions">
        <app-button variant="outline" (clicked)="closeModal()">Cancel</app-button>
        <app-button (clicked)="confirmRoomSelection()" [disabled]="!selectedRooms()">
          Confirm Selection
        </app-button>
      </div>
    </app-modal>
  `,
  styles: [`
    .calendar-container {
      background: #1a1a1a;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      border: 1px solid #2a2a2a;
    }
    .calendar-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; }
    .calendar-title { font-size:1.5rem; font-weight:700; color:#ffffff; margin:0; text-transform:uppercase; letter-spacing:2px; }
    .nav-btn { background:#0a0a0a; border:2px solid #2a2a2a; border-radius:.5rem; padding:.5rem; cursor:pointer; transition:.3s; color:#fff; }
    .nav-btn:hover:not(:disabled){ border-color:#ec3f3a; color:#ec3f3a; box-shadow: 0 0 10px rgba(255, 0, 64, 0.3); }
    .nav-btn:disabled{ opacity:.5; cursor:not-allowed; }
    .legend{ display:flex; gap:2rem; margin-bottom:1.5rem; flex-wrap:wrap; }
    .legend-item{ display:flex; align-items:center; gap:.5rem; font-size:.875rem; color:#aaa; }
    .legend-dot{ width:1rem; height:1rem; border-radius:.25rem; }
    .legend-dot.available{ background:#10b981; }
    .legend-dot.reserved{ background:#f59e0b; }
    .legend-dot.booked{ background:#ef4444; }
    .legend-dot.unavailable{ background:#555; }
    .schedule-grid{ display:grid; grid-template-columns:100px repeat(7,1fr); gap:1px; background:#0a0a0a; border-radius:.5rem; overflow:hidden; margin-bottom:2rem; }
    .time-column,.day-column{ display:flex; flex-direction:column; gap:1px; }
    .header-cell{ background:#2a2a2a; padding:1rem; font-weight:600; color:#ffffff; text-align:center; min-height:70px; display:flex; flex-direction:column; justify-content:center; align-items:center; text-transform:uppercase; letter-spacing:1px; }
    .day-name{ font-size:.875rem; margin-bottom:.25rem; }
    .day-date{ font-size:.75rem; color:#aaa; font-weight:400; }
    .time-cell{ background:#2a2a2a; padding:1rem .5rem; font-size:.75rem; color:#aaa; text-align:center; min-height:60px; display:flex; align-items:center; justify-content:center; }
    .slot-cell{ background:#1a1a1a; min-height:60px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:.2s; position:relative; }
    .slot-cell.available{ background:#1f1d18; border:2px solid #333333; }
    .slot-cell.available:hover{ background:#333333; transform:scale(1.05); z-index:1; box-shadow:0 4px 6px #333333; }
    .slot-cell.booked{ background:#3a0f0f; border:2px solid #ef4444; cursor:not-allowed; }
    .slot-cell.reserved{ background:#3a2f0f; border:2px solid #f59e0b; cursor:not-allowed; }
    .slot-cell.unavailable{ background:#1a1a1a; border:2px solid #333; cursor:not-allowed; }
    .slot-cell.selected{ background:#ec3f3a !important; border:3px solid #ec3f3a !important; transform:scale(1.05); z-index:2; box-shadow:0 4px 12px rgba(255,0,64,.6); }
    .slot-cell.selected .slot-content{ color:white; font-weight:700; }
    .slot-content{ font-size:.75rem; text-align:center; width:100%; padding:.5rem; }
    .slot-available{ display:flex; flex-direction:column; gap:.25rem; }
    .available-label{ color:#10b981; font-weight:600; font-size:.7rem; text-transform:uppercase; letter-spacing:.5px; }
    .spots{ color:#10b981; font-weight:700; font-size:.875rem; }
    .status-text{ color:#aaa; font-size:.7rem; text-transform:uppercase; font-weight:600; }
    .selection-summary{ background:#ec3f3a; color:white; padding:1.5rem; border-radius:.75rem; animation:slideUp .3s ease; box-shadow: 0 0 20px rgba(255, 0, 64, 0.5); }
    @keyframes slideUp{ from{opacity:0; transform:translateY(20px);} to{opacity:1; transform:translateY(0);} }
    .summary-content{ display:flex; align-items:center; gap:1rem; }
    .summary-icon{ width:3rem; height:3rem; background:rgba(255,255,255,.2); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.5rem; }
    .summary-text{ flex:1; font-size:1.125rem; }
    .confirm-btn{ background:white; color:#ec3f3a; border:none; padding:.75rem 1.5rem; border-radius:.5rem; font-weight:600; cursor:pointer; transition:.3s; text-transform:uppercase; letter-spacing:1px; }
    .confirm-btn:hover{ transform:translateY(-2px); box-shadow:0 4px 12px rgba(0,0,0,.4); background:#f5f5f5; }
    .rooms-badge{ display:inline-block; background:rgba(255,255,255,.3); padding:.25rem .75rem; border-radius:.5rem; font-size:.875rem; font-weight:600; margin-left:.5rem; }
    .room-selection{ padding:1rem 0; }
    .modal-description{ font-size:1rem; color:#aaa; margin-bottom:1.5rem; line-height:1.5; }
    .available-info{ display:flex; align-items:center; gap:.5rem; background:#0a2a3a; border:1px solid #3b82f6; border-radius:.5rem; padding:.75rem; margin-bottom:1.5rem; color:#93c5fd; font-size:.875rem; font-weight:500; }
    .info-icon{ flex-shrink:0; color:#3b82f6; }
    .room-options{ display:grid; grid-template-columns:repeat(auto-fit, minmax(140px,1fr)); gap:1rem; }
    .room-option{ border:3px solid #2a2a2a; border-radius:.75rem; padding:1.5rem 1rem; text-align:center; cursor:pointer; transition:.3s; position:relative; background:#1a1a1a; color:#fff; }
    .room-option:hover{ border-color:#ec3f3a; transform:translateY(-2px); box-shadow:0 4px 12px rgba(255,0,64,.4); }
    .room-option.selected{ border-color:#ec3f3a; background:#ec3f3a; color:white; box-shadow: 0 0 20px rgba(255, 0, 64, 0.6); }
    .room-icon{ margin-bottom:.75rem; position:relative; display:inline-block; }
    .room-icon svg{ color:#ec3f3a; transition:color .3s; }
    .room-option.selected .room-icon svg{ color:white; }
    .room-count-badge{ position:absolute; top:-5px; right:-5px; background:#ef4444; color:white; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:.75rem; font-weight:700; }
    .room-label{ font-size:1rem; font-weight:600; margin-bottom:.5rem; }
    .check-icon{ margin-top:.5rem; font-size:1.5rem; }
    .modal-actions{ display:flex; gap:1rem; justify-content:flex-end; }
    @media (max-width:1200px){ .schedule-grid{ overflow-x:auto; } }
    @media (max-width:768px){
      .calendar-container{ padding:1rem; }
      .schedule-grid{ grid-template-columns:80px repeat(7,120px); }
      .legend{ gap:1rem; }
      .summary-content{ flex-direction:column; text-align:center; }
    }
  `]
})
export class CalendarComponent implements OnInit {
  private bookingService = inject(BookingService);

  @Input() gameId: string = '';
  @Input() maxConcurrentBookings: number = 2;
  @Output() slotSelected = new EventEmitter<SlotSelection>();

  weekSchedule = signal<DaySchedule[]>([]);
  timeSlots = signal<string[]>([]);
  selectedSlot = signal<SlotSelection | null>(null);
  showRoomModal = signal(false);
  modalSlot = signal<TimeSlotAvailability | null>(null);
  modalDate = signal('');
  modalTime = signal('');
  selectedRooms = signal<number>(0);
  currentWeekStart = new Date();
  loading = signal(false);
  availabilityCache = new Map<string, {availableSlots: number; timestamp: number}>();

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
    const start = new Date(this.currentWeekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];

    this.loading.set(true);
    this.bookingService.getAvailability(startDateStr, endDateStr).subscribe({
      next: (data) => {
        // If your API returns plain strings for dates, gently normalize:
        const mapped: DaySchedule[] = data.map(d => ({
          ...d,
          date: new Date(d.date as unknown as string),
        }));
        this.weekSchedule.set(mapped);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load availability', err);
        this.weekSchedule.set([]);
        this.loading.set(false);
      }
    });
  }

  isTimePast(time: string): boolean {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);
    return slotTime < now;
  }

  openSlotModal(date: string, time: string, slot: TimeSlotAvailability): void {
    if (slot.status === 'available') {
      this.modalDate.set(date);
      this.modalTime.set(time);
      this.modalSlot.set(slot);
      this.selectedRooms.set(0);
      this.showRoomModal.set(true);
    }
  }

  closeModal(): void {
    this.showRoomModal.set(false);
    this.selectedRooms.set(0);
  }

  getRoomOptions(): number[] {
    const available = this.modalSlot()?.availableSpots || 0;
    const options: number[] = [];
    for (let i = 1; i <= available; i++) options.push(i);
    return options;
  }

  selectRooms(count: number): void {
    this.selectedRooms.set(count);
  }

  confirmRoomSelection(): void {
    if (this.selectedRooms() > 0) {
      this.selectedSlot.set({
        date: this.modalDate(),
        time: this.modalTime(),
        rooms: this.selectedRooms()
      });
      this.closeModal();
    }
  }

  formatModalDate(): string {
    const date = new Date(this.modalDate());
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  isSelected(date: string, time: string): boolean {
    const selected = this.selectedSlot();
    return selected?.date === date && selected?.time === time;
  }

  confirmSelection(): void {
    const selected = this.selectedSlot();
    if (selected) this.slotSelected.emit(selected);
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

  refreshAvailability(): void {
    this.availabilityCache.clear();
    this.loadWeekSchedule();
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
