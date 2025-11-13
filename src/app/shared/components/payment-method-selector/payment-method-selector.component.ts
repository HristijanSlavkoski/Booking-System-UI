import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {PaymentMethod} from "../../../models/booking.model";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
    selector: 'app-payment-method-selector',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslatePipe],
    templateUrl: './payment-method-selector.component.html',
    styleUrls: ['./payment-method-selector.component.scss']
})
export class PaymentMethodSelectorComponent {
    @Input() paymentMethod: PaymentMethod | null = null;
    @Output() paymentMethodChange = new EventEmitter<PaymentMethod | null>();

    select(method: PaymentMethod) {
        this.paymentMethod = method;
        this.paymentMethodChange.emit(method);
    }

    protected readonly PaymentMethod = PaymentMethod;
}
