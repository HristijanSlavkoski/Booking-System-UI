import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonComponent} from '../button/button.component';
import {BookingSummaryComponent, RoomSummary} from '../booking-summary/booking-summary.component';
import {PaymentMethodSelectorComponent} from "../payment-method-selector/payment-method-selector.component";
import {PaymentMethod} from "../../../models/booking.model";

@Component({
    selector: 'app-payment-step',
    standalone: true,
    imports: [CommonModule, ButtonComponent, BookingSummaryComponent, PaymentMethodSelectorComponent],
    templateUrl: './payment-step.component.html',
    styleUrls: ['./payment-step.component.scss']
})
export class PaymentStepComponent {
    // Summary inputs
    @Input() date = '';
    @Input() time = '';
    @Input() rooms = 1;
    @Input() totalPlayers = 0;
    @Input() roomSummaries: RoomSummary[] = [];
    @Input() net = 0;
    @Input() vat = 0;
    @Input() total = 0;
    @Input() taxPercent = 0;
    @Input() currency = 'MKD';

    @Input() paymentMethod: PaymentMethod | null = null;
    @Output() paymentMethodChange = new EventEmitter<PaymentMethod | null>();

    @Input() submitting = false;
    @Output() back = new EventEmitter<void>();
    @Output() submit = new EventEmitter<void>();
}
