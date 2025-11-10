import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonComponent} from '../button/button.component';
import {BookingSummaryComponent, RoomSummary} from '../booking-summary/booking-summary.component';
import {PaymentMethodSelectorComponent} from "../payment-method-selector/payment-method-selector.component";
import {Customer, PaymentMethod} from "../../../models/booking.model";
import {FormsModule} from "@angular/forms";
import {ContactDetailsComponent} from "../contact-details/contact-details.component";
import {BookingStore} from "../../stores/booking.store";
import {GiftCardUiService} from '../../../core/services/gift-card.service';

@Component({
    selector: 'app-payment-step',
    standalone: true,
    imports: [
        CommonModule,
        ButtonComponent,
        BookingSummaryComponent,
        PaymentMethodSelectorComponent,
        FormsModule,
        ContactDetailsComponent
    ],
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

    // promo / gift card
    @Input() baseTotal: number | null = null;
    @Input() promoPercent: number | null = null;
    @Input() promoName: string | null = null;

    @Input() giftCardAmount: number | null = null;
    @Input() giftCardCode: string | null = null;

    @Input() customer!: Customer;
    @Output() customerChange = new EventEmitter<Customer>();

    @Input() paymentMethod: PaymentMethod | null = null;
    @Output() paymentMethodChange = new EventEmitter<PaymentMethod | null>();

    @Input() submitting = false;
    @Output() back = new EventEmitter<void>();
    @Output() submit = new EventEmitter<void>();

    store = inject(BookingStore);
    private giftCardService = inject(GiftCardUiService);

    // local UI state for gift card input
    giftCode: string = '';
    giftLoading = false;
    giftError: string | null = null;

    ngOnInit() {
        // prefill from store/inputs if present
        if (this.giftCardCode) {
            this.giftCode = this.giftCardCode;
        }
    }

    onCustomerField<K extends keyof Customer>(key: K, value: string) {
        this.customerChange.emit({...this.customer, [key]: value});
    }

    get isCustomerValid(): boolean {
        return this.store.isCustomerValid();
    }

    applyGiftCard() {
        const code = (this.giftCode || '').trim();
        this.giftError = null;

        if (!code) {
            // clear gift card if user emptied field
            this.store.clearGiftCard();
            return;
        }

        this.giftLoading = true;

        this.giftCardService.peek(code).subscribe({
            next: (res) => {
                const amount = res.amount ?? 0;
                if (!amount || amount <= 0) {
                    this.giftError = 'Gift card has no remaining balance.';
                    this.store.clearGiftCard();
                } else {
                    this.store.setGiftCard(code, amount);
                    this.giftError = null;
                }
                this.giftLoading = false;
            },
            error: (err) => {
                console.error('Failed to validate gift card', err);
                this.giftError = 'Gift card not valid or already used.';
                this.store.clearGiftCard();
                this.giftLoading = false;
            }
        });
    }
}
