import { Component, Input, Output, EventEmitter, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../button/button.component';
import { BookingService } from '../../../core/services/booking.service';
import { Game } from '../../../models/game.model';
import {TranslatePipe, TranslateService} from "@ngx-translate/core";

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
  imports: [CommonModule, ModalComponent, ButtonComponent, TranslatePipe],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  private bookingService = inject(BookingService);
  private i18n = inject(TranslateService);

  @Input() gameId: string = '';
  @Input() gameData: Game | null = null;
  @Input() maxConcurrentBookings: number = 2;
  @Input() lang: 'en' | 'mk' = 'en';

  @Output() slotSelected = new EventEmitter<SlotSelection>();
  @Output() gamePickRequested = new EventEmitter<{ date: string; time: string }>();

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
  availabilityCache = new Map<string, { availableSlots: number; timestamp: number }>();

  private get locale(): string {
    return this.lang === 'mk' ? 'mk-MK' : 'en-GB';
  }

  ngOnInit(): void {
    this.i18n.use(this.lang);
    this.setToStartOfWeek(this.currentWeekStart);
    this.generateTimeSlots();
    this.loadWeekSchedule();
  }

  generateTimeSlots(): void {
    const slots: string[] = [];
    for (let hour = 9; hour <= 21; hour++) slots.push(`${hour.toString().padStart(2, '0')}:00`);
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
        const mapped: DaySchedule[] = data.map((d: any) => ({
          ...d,
          date: new Date(d.date as string),
        }));
        this.weekSchedule.set(mapped);
        this.loading.set(false);
      },
      error: () => {
        this.weekSchedule.set([]);
        this.loading.set(false);
      },
    });
  }

  isPastSlot(dayDate: Date, time: string): boolean {
    const [h, m] = time.split(':').map(Number);
    const dt = new Date(dayDate);
    dt.setHours(h, m ?? 0, 0, 0);
    return dt.getTime() < Date.now();
  }

  openSlotModal(date: string, time: string, slot: TimeSlotAvailability, day?: Date): void {
    // block if not available or past
    const dayObj = day ?? new Date(date);
    if (slot.status !== 'available' || this.isPastSlot(dayObj, time)) return;

    if (!this.gameId || this.gameId.trim().length === 0) {
      this.gamePickRequested.emit({ date, time });
      return;
    }

    this.modalDate.set(date);
    this.modalTime.set(time);
    this.modalSlot.set(slot);
    this.selectedRooms.set(0);
    this.showRoomModal.set(true);
  }

  closeModal(): void {
    this.showRoomModal.set(false);
    this.selectedRooms.set(0);
  }

  getRoomOptions(): number[] {
    const available = this.modalSlot()?.availableSpots || 0;
    return Array.from({ length: available }, (_, i) => i + 1);
  }

  selectRooms(count: number): void {
    this.selectedRooms.set(count);
  }

  confirmRoomSelection(): void {
    if (this.selectedRooms() > 0) {
      this.selectedSlot.set({
        date: this.modalDate(),
        time: this.modalTime(),
        rooms: this.selectedRooms(),
      });
      this.closeModal();
    }
  }

  isSelected(date: string, time: string): boolean {
    const s = this.selectedSlot();
    return !!s && s.date === date && s.time === time;
  }

  confirmSelection(): void {
    const s = this.selectedSlot();
    if (s) this.slotSelected.emit(s);
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

  formatHeader(day: Date): { name: string; date: string } {
    return {
      name: day.toLocaleDateString(this.locale, { weekday: 'short' }).toUpperCase(),
      date: day.toLocaleDateString(this.locale, { month: 'numeric', day: 'numeric' }),
    };
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
  }

  formatModalDate(): string {
    const date = new Date(this.modalDate());
    return date.toLocaleDateString(this.locale, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  formatSelectedDate(): string {
    const s = this.selectedSlot();
    if (!s) return '';
    const d = new Date(s.date);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  setToStartOfWeek(date: Date): void {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
  }
}
