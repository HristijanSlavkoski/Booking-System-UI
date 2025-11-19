// src/app/pages/admin/dashboard/admin-dashboard.component.ts
import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {BookingService} from '../../../core/services/booking.service';
import {Booking, BookingStatus} from '../../../models/booking.model';
import {ButtonComponent} from '../../../shared/components/button/button.component';
import {LoadingComponent} from '../../../shared/components/loading/loading.component';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonComponent, LoadingComponent],
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
    private bookingService = inject(BookingService);

    loading = signal(false);

    stats = signal({
        todayBookings: 0,
        confirmedToday: 0,
        todayRevenue: 0
    });

    totalBookings = signal(0);
    todayBookings = signal<Booking[]>([]);

    ngOnInit(): void {
        this.loadDashboardData();
    }

    private loadDashboardData(): void {
        this.loading.set(true);

        this.bookingService.getAllBookings().subscribe({
            next: (bookings) => {
                this.loading.set(false);

                const all: Booking[] = bookings ?? [];
                this.totalBookings.set(all.length);

                const now = new Date();

                // 🔹 Filter bookings for "today" based on bookingDate
                const todays = all.filter((b) =>
                    this.isSameDay(b.bookingDate, now)
                );
                this.todayBookings.set(todays);

                // 🔹 Confirmed today
                const confirmedToday = todays.filter(
                    (b) => b.status === BookingStatus.CONFIRMED
                ).length;

                // 🔹 Revenue today (you can later restrict to PAID if you want)
                const todayRevenue = todays.reduce(
                    (sum, b) => sum + (b.totalPrice ?? 0),
                    0
                );

                this.stats.set({
                    todayBookings: todays.length,
                    confirmedToday,
                    todayRevenue
                });
            },
            error: (error) => {
                console.error('Error loading bookings:', error);
                this.loading.set(false);
            }
        });
    }

    private isSameDay(date: Date | string, today: Date): boolean {
        if (!date) return false;

        const d = typeof date === 'string' ? new Date(date) : date;

        return (
            d.getFullYear() === today.getFullYear() &&
            d.getMonth() === today.getMonth() &&
            d.getDate() === today.getDate()
        );
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

    getPaymentLabel(method: string | undefined): string {
        if (!method) return '-';
        if (method === 'ONLINE') return 'Online';
        if (method === 'IN_PERSON') return 'In person';
        return method;
    }
}
