// src/app/pages/admin/schedule/admin-schedule.component.ts
import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Booking} from '../../../models/booking.model';
import {BookingService} from '../../../core/services/booking.service';
import {NotificationService} from '../../../core/services/notification.service';
import {LoadingComponent} from "../../../shared/components/loading/loading.component";
import {TranslatePipe} from "@ngx-translate/core";
import {ButtonComponent} from "../../../shared/components/button/button.component";

interface ScheduleSlot {
    time: string;
    bookings: Booking[];
}

@Component({
    selector: 'app-admin-schedule',
    standalone: true,
    imports: [CommonModule, LoadingComponent, TranslatePipe, ButtonComponent],
    templateUrl: './admin-schedule.component.html',
    styleUrls: ['./admin-schedule.component.scss'],
})
export class AdminScheduleComponent implements OnInit {
    private bookingService = inject(BookingService);
    private notificationService = inject(NotificationService);

    loading = signal(false);

    // yyyy-MM-dd for <input type="date">
    selectedDate = signal<string>(this.toDateInputValue(new Date()));

    // flat list from API
    bookings = signal<Booking[]>([]);

    // grouped by bookingTime for rendering
    slots = signal<ScheduleSlot[]>([]);

    ngOnInit(): void {
        this.loadSchedule();
    }

    private toDateInputValue(date: Date): string {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const formattedMonth = String(month).padStart(2, '0');
        const formattedDay = String(day).padStart(2, '0');
        return `${year}-${formattedMonth}-${formattedDay}`;
    }

    setToday(): void {
        this.selectedDate.set(this.toDateInputValue(new Date()));
        this.loadSchedule();
    }

    changeDay(delta: number): void {
        const current = new Date(this.selectedDate());
        current.setDate(current.getDate() + delta);
        this.selectedDate.set(this.toDateInputValue(current));
        this.loadSchedule();
    }

    onDateChange(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        if (!value) return;
        this.selectedDate.set(value);
        this.loadSchedule();
    }

    loadSchedule(): void {
        this.loading.set(true);
        const date = this.selectedDate();

        this.bookingService.getBookingsByDate(date).subscribe({
            next: (bookings) => {
                this.bookings.set(bookings ?? []);
                this.buildSlots();
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading schedule:', err);
                this.notificationService.error('Failed to load schedule');
                this.bookings.set([]);
                this.slots.set([]);
                this.loading.set(false);
            },
        });
    }

    private buildSlots(): void {
        const list = this.bookings() ?? [];
        const map = new Map<string, Booking[]>();

        for (const b of list) {
            const time = b.bookingTime ?? '';
            if (!map.has(time)) {
                map.set(time, []);
            }
            map.get(time)!.push(b);
        }

        const slots: ScheduleSlot[] = Array.from(map.entries())
            .sort(([t1], [t2]) => t1.localeCompare(t2))
            .map(([time, bookings]) => ({
                time,
                bookings,
            }));

        this.slots.set(slots);
    }

    getGameName(booking: Booking): string {
        const firstGame = booking.bookingGames?.[0];
        return firstGame?.gameName ?? '—';
    }

    getPlayerCount(booking: Booking): number {
        const sum =
            booking.bookingGames?.reduce((acc, g) => acc + (g.playerCount ?? 0), 0) ??
            0;
        return sum;
    }

    getStatusClass(status: string): string {
        if (!status) return 'status-unknown';
        const s = status.toLowerCase();
        if (s === 'confirmed' || s === 'completed') return 'status-confirmed';
        if (s === 'pending') return 'status-pending';
        if (s === 'cancelled' || s === 'no_show') return 'status-cancelled';
        return 'status-unknown';
    }
}
