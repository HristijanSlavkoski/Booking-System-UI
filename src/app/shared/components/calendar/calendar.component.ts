// calendar.components.ts
import {Component, EventEmitter, inject, Input, OnInit, Output, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BookingService} from '../../../core/services/booking.service';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {Game} from '../../../models/game.model';

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
    rooms: number; // kept for type compatibility with parent
}

@Component({
    selector: 'app-calendar',
    standalone: true,
    imports: [CommonModule, TranslatePipe],
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

    /** Parent hooks */
    @Output() slotSelected = new EventEmitter<SlotSelection>();                   // go straight to next page
    @Output() gamePickRequested = new EventEmitter<{ date: string; time: string }>(); // open game picker in parent
    @Output() clearGameRequested = new EventEmitter<void>();

    weekSchedule = signal<DaySchedule[]>([]);
    timeSlots = signal<string[]>([]);
    loading = signal(false);
    currentWeekStart = new Date();

    get locale(): string {
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
        for (let hour = 9; hour <= 22; hour++) slots.push(`${hour.toString().padStart(2, '0')}:00`);
        this.timeSlots.set(slots);
    }

    onClearGameClick(ev: MouseEvent) {
        ev.stopPropagation();
        this.clearGameRequested.emit();
    }

    difficultyPercent(diff?: number): number {
        const n = Number(diff ?? 0);
        return Math.max(0, Math.min(5, n)) * 20;
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
                const mapped: DaySchedule[] = data.map((d: any) => ({...d, date: new Date(d.date as string)}));
                this.weekSchedule.set(mapped);
                this.loading.set(false);
            },
            error: () => {
                this.weekSchedule.set([]);
                this.loading.set(false);
            },
        });
    }

    /** Past check: day + time < now */
    isPastSlot(dayDate: Date, time: string): boolean {
        const [h, m] = time.split(':').map(Number);
        const dt = new Date(dayDate);
        dt.setHours(h, m ?? 0, 0, 0);
        return dt.getTime() < Date.now();
    }

    /** Click behavior: no game -> ask parent to pick; with game -> emit selection (parent navigates). */
    openSlot(date: string, time: string, slot: TimeSlotAvailability, day: Date): void {
        if (slot.status !== 'available' || this.isPastSlot(day, time)) return;

        if (!this.gameId?.trim()) {
            this.gamePickRequested.emit({date, time});
            return;
        }
        this.slotSelected.emit({date, time, rooms: 1});
    }

    previousWeek(): void {
        if (this.canGoPrevious()) {
            this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
            this.loadWeekSchedule();
        }
    }

    nextWeek(): void {
        this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
        this.loadWeekSchedule();
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
        const startStr = start.toLocaleDateString(this.locale, {month: 'short', day: 'numeric'});
        const endStr = end.toLocaleDateString(this.locale, {month: 'short', day: 'numeric', year: 'numeric'});
        return `${startStr} - ${endStr}`;
    }

    formatHeader(day: Date): { name: string; date: string } {
        return {
            name: day.toLocaleDateString(this.locale, {weekday: 'short'}).toUpperCase(),
            date: day.toLocaleDateString(this.locale, {month: 'numeric', day: 'numeric'}),
        };
    }

    setToStartOfWeek(date: Date): void {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        date.setDate(diff);
        date.setHours(0, 0, 0, 0);
    }
}
