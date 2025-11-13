import {Component, inject, Input} from '@angular/core';
import {CommonModule, formatDate} from '@angular/common';
import {PriceSummaryComponent} from "../price-summary/price-summary.component";
import {TranslatePipe} from "@ngx-translate/core";
import {BookingStore} from "../../stores/booking.store";

export interface RoomSummary {
    name: string | null;
    playerCount: number;
}

@Component({
    selector: 'app-booking-summary',
    standalone: true,
    imports: [CommonModule, PriceSummaryComponent, TranslatePipe],
    templateUrl: './booking-summary.component.html',
    styleUrls: ['./booking-summary.component.scss']
})
export class BookingSummaryComponent {
    @Input() date = '';
    @Input() time = '';
    @Input() rooms = 1;
    @Input() totalPlayers = 0;
    @Input() taxPercent = 0;
    @Input() net = 0;
    @Input() vat = 0;
    @Input() total = 0;
    @Input() currency = 'MKD';

    @Input() roomSummaries: RoomSummary[] = [];

    // after promotion, before gift card
    @Input() baseTotal: number | null = null;
    @Input() promoTotal: number | null = null;
    @Input() promoPercent: number | null = null;
    @Input() promoName: string | null = null;

    // gift card
    @Input() giftCardAmount: number | null = null;
    @Input() giftCardCode: string | null = null;

    store = inject(BookingStore);

    formatDateLocale(dateString: string): string {
        if (!dateString) return '';

        const locale = this.store.lang() === 'mk' ? 'mk' : 'en-GB';

        return formatDate(dateString, 'EEEE, d MMMM y', locale);
    }
}
