// calendar.components.ts
import {Component, computed, EventEmitter, inject, Input, OnInit, Output, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BookingService} from '../../../core/services/booking.service';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {Game} from '../../../models/game.model';
import {BookingStore} from "../../stores/booking.store";

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
    private store = inject(BookingStore);
    private autoAdvancedThisInit = false;

    @Input() gameId: string = '';
    @Input() gameData: Game | null = null;
    @Input() maxConcurrentBookings: number = 2;
    @Input() lang: 'en' | 'mk' = 'en';

    /** Parent hooks */
    @Output() slotSelected = new EventEmitter<SlotSelection>();                   // go straight to next page
    @Output() gamePickRequested = new EventEmitter<{ date: string; time: string }>(); // open game picker in parent
    @Output() clearGameRequested = new EventEmitter<void>();

    weekSchedule = signal<DaySchedule[]>([]);
    timeSlots = computed(() => this.store.buildTimeSlots());
    loading = signal(false);
    currentWeekStart = new Date();

    get locale(): string {
        return this.lang === 'mk' ? 'mk-MK' : 'en-GB';
    }

    ngOnInit(): void {
        this.i18n.use(this.lang);
        this.setToStartOfWeek(this.currentWeekStart);
        this.loadWeekSchedule();
    }

    onClearGameClick(ev: MouseEvent) {
        ev.stopPropagation();
        this.clearGameRequested.emit();
    }

    difficultyPercent(diff?: number): number {
        const n = Number(diff ?? 0);
        return Math.max(0, Math.min(5, n)) * 20;
    }

    private formatLocalYMD(d: Date): string {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
    }

    loadWeekSchedule(): void {
        const start = new Date(this.currentWeekStart);     // already snapped to Monday
        const end = new Date(start);
        end.setDate(start.getDate() + 6);                  // Monday → Sunday

        const startDateStr = this.formatLocalYMD(start);
        const endDateStr = this.formatLocalYMD(end);

        this.loading.set(true);
        this.bookingService.getAvailability(startDateStr, endDateStr).subscribe({
            next: (data) => {
                const mapped: DaySchedule[] = data
                    .map((d: any) => ({...d, date: new Date(d.date as string)}))
                    .sort((a, b) => a.date.getTime() - b.date.getTime());

                this.weekSchedule.set(mapped);
                this.loading.set(false);

                this.maybeAutoAdvanceIfWeekExpired();
            },
            error: () => {
                this.weekSchedule.set([]);
                this.loading.set(false);
            },
        });
    }

    /** Returns true if now is strictly after the end of the last slot in the visible week */
    private isPastAllSlotsInView(): boolean {
        const days = this.weekSchedule();
        if (!days || days.length === 0) return false;

        // Find the latest slot (by date + time) across the whole visible week
        let latestEnd: Date | null = null;

        for (const day of days) {
            if (!day.slots || day.slots.length === 0) continue;

            // assume slots are sorted by time; if not, get max by time
            const last = day.slots.reduce((a, b) => (a.time > b.time ? a : b));
            const [hh, mm] = last.time.split(':').map(Number);

            // start = day date at last slot time
            const start = new Date(day.date);
            start.setHours(hh || 0, mm || 0, 0, 0);

            // end = start + slotDuration
            const duration =
                typeof this.store.slotDurationMinutes === 'function'
                    ? this.store.slotDurationMinutes()
                    : (this.store.slotDurationMinutes ?? 60);

            const end = new Date(start.getTime() + duration * 60_000);
            if (!latestEnd || end > latestEnd) latestEnd = end;
        }

        if (!latestEnd) return false;
        return Date.now() > latestEnd.getTime();
    }

// call this right after you set weekSchedule (i.e., in loadWeekSchedule() success)
    private maybeAutoAdvanceIfWeekExpired(): void {
        if (this.autoAdvancedThisInit) return;
        if (!this.isViewingThisWeek()) return;

        if (this.isPastAllSlotsInView()) {
            this.autoAdvancedThisInit = true;
            this.nextWeek();
        }
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

    private startOfWeek(d: Date): Date {
        const x = new Date(d);
        const day = x.getDay(); // 0=Sun,1=Mon...
        const diff = x.getDate() - day + (day === 0 ? -6 : 1); // snap to Monday
        x.setDate(diff);
        x.setHours(0, 0, 0, 0);
        return x;
    }

    private isViewingThisWeek(): boolean {
        const nowWeek = this.startOfWeek(new Date()).getTime();
        const curWeek = this.startOfWeek(this.currentWeekStart).getTime();
        return nowWeek === curWeek;
    }
}
