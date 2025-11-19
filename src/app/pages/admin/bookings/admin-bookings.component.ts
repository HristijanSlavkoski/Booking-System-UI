// src/app/pages/admin/bookings/admin-bookings.component.ts
import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {Booking, BookingStatus} from '../../../models/booking.model';
import {BookingService} from '../../../core/services/booking.service';
import {NotificationService} from '../../../core/services/notification.service';
import {ButtonComponent} from "../../../shared/components/button/button.component";
import {LoadingComponent} from "../../../shared/components/loading/loading.component";

@Component({
    selector: 'app-admin-bookings',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonComponent, LoadingComponent],
    templateUrl: './admin-bookings.component.html',
    styleUrls: ['./admin-bookings.component.scss']
})
export class AdminBookingsComponent implements OnInit {
    private bookingService = inject(BookingService);
    private notificationService = inject(NotificationService);

    loading = signal(false);
    bookings = signal<Booking[]>([]);

    // filters
    filterStatus = signal<'ALL' | BookingStatus>('ALL');
    filterDate = signal<string>('');

    readonly statusOptions: { value: 'ALL' | BookingStatus; label: string }[] = [
        {value: 'ALL', label: 'All statuses'},
        {value: BookingStatus.PENDING, label: 'Pending'},
        {value: BookingStatus.CONFIRMED, label: 'Confirmed'},
        {value: BookingStatus.COMPLETED, label: 'Completed'},
        {value: BookingStatus.CANCELLED, label: 'Cancelled'},
        {value: BookingStatus.NO_SHOW, label: 'No show'}
    ];

    BookingStatus = BookingStatus; // for template if needed

    ngOnInit(): void {
        this.loadBookings();
    }

    loadBookings(): void {
        this.loading.set(true);

        const status = this.filterStatus();
        const date = this.filterDate();

        let obs;

        if (date) {
            // filter by date
            obs = this.bookingService.getBookingsByDate(date);
        } else if (status !== 'ALL') {
            // filter by status
            obs = this.bookingService.getBookingsByStatus(status);
        } else {
            // all bookings
            obs = this.bookingService.getAllBookings();
        }

        obs.subscribe({
            next: (list) => {
                this.bookings.set(list ?? []);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading bookings', err);
                this.notificationService.error('Failed to load bookings');
                this.loading.set(false);
            }
        });
    }

    onStatusChange(value: string): void {
        this.filterStatus.set(value as 'ALL' | BookingStatus);
        this.loadBookings();
    }

    onDateChange(value: string): void {
        this.filterDate.set(value);
        this.loadBookings();
    }

    clearFilters(): void {
        this.filterStatus.set('ALL');
        this.filterDate.set('');
        this.loadBookings();
    }

    refresh(): void {
        this.loadBookings();
    }

    // ---------- helpers for display ----------

    getCustomerName(b: Booking): string {
        const first =
            (b as any).customerFirstName ||
            '';
        const last =
            (b as any).customerLastName ||
            '';
        return `${first} ${last}`.trim() || '-';
    }

    getGameSummary(b: Booking): string {
        if (!b.bookingGames || b.bookingGames.length === 0) {
            return '-';
        }
        if (b.bookingGames.length === 1) {
            return b.bookingGames[0].gameName;
        }
        const [first, ...rest] = b.bookingGames;
        return `${first.gameName} (+${rest.length} more)`;
    }

    getTotalPlayers(b: Booking): number {
        if (typeof (b as any).playerCount === 'number') {
            return (b as any).playerCount;
        }
        if (!b.bookingGames) return 0;
        return b.bookingGames.reduce((sum, bg) => sum + (bg.playerCount ?? 0), 0);
    }

    getStatusClass(status: BookingStatus): string {
        switch (status) {
            case BookingStatus.CONFIRMED:
                return 'status-badge confirmed';
            case BookingStatus.PENDING:
                return 'status-badge pending';
            case BookingStatus.CANCELLED:
                return 'status-badge cancelled';
            case BookingStatus.COMPLETED:
                return 'status-badge completed';
            case BookingStatus.NO_SHOW:
                return 'status-badge no-show';
            default:
                return 'status-badge';
        }
    }

    getPaymentLabel(method: string | undefined): string {
        if (!method) return '-';
        if (method === 'ONLINE') return 'Online';
        if (method === 'IN_PERSON') return 'In person';
        return method;
    }

    // ---------- actions ----------

    canConfirm(b: Booking): boolean {
        return b.status === BookingStatus.PENDING;
    }

    canComplete(b: Booking): boolean {
        return b.status === BookingStatus.CONFIRMED;
    }

    canCancel(b: Booking): boolean {
        return b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED;
    }

    changeStatus(b: Booking, status: BookingStatus): void {
        this.bookingService.updateBookingStatus(b.id, status).subscribe({
            next: (updated) => {
                this.notificationService.success(`Booking marked as ${status}`);
                // cheap refresh
                this.loadBookings();
            },
            error: (err) => {
                console.error('Update status error', err);
                this.notificationService.error('Failed to update status');
            }
        });
    }

    cancelBooking(b: Booking): void {
        if (!confirm(`Cancel booking for ${this.getCustomerName(b)} on ${b.bookingDate}?`)) {
            return;
        }

        this.bookingService.cancelBooking(b.id).subscribe({
            next: () => {
                this.notificationService.success('Booking cancelled');
                this.loadBookings();
            },
            error: (err) => {
                console.error('Cancel booking error', err);
                this.notificationService.error('Failed to cancel booking');
            }
        });
    }
}
