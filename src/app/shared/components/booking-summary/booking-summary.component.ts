import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PriceSummaryComponent} from "../price-summary/price-summary.component";

export interface RoomSummary {
    name: string | null;
    playerCount: number;
}

@Component({
    selector: 'app-booking-summary',
    standalone: true,
    imports: [CommonModule, PriceSummaryComponent],
    templateUrl: './booking-summary.component.html',
    styleUrls: ['./booking-summary.component.scss']
})
export class BookingSummaryComponent {
    @Input() date = '';           // already formatted or raw; parent decides
    @Input() time = '';
    @Input() rooms = 1;
    @Input() totalPlayers = 0;
    @Input() taxPercent = 0;
    @Input() net = 0;
    @Input() vat = 0;
    @Input() total = 0;
    @Input() currency = 'MKD';

    @Input() roomSummaries: RoomSummary[] = [];
    @Input() baseTotal: number | null = null;
    @Input() promoPercent: number | null = null;
    @Input() promoName: string | null = null;
}
