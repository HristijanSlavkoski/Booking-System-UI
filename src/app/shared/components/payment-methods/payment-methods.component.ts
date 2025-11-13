import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PaymentMethod} from "../../../models/booking.model";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
    selector: 'app-payment-methods',
    standalone: true,
    imports: [CommonModule, TranslatePipe],
    templateUrl: './payment-methods.component.html',
    styleUrls: ['./payment-methods.component.scss']
})
export class PaymentMethodsComponent {
    @Input() value: PaymentMethod | null = null;
    @Output() valueChange = new EventEmitter<PaymentMethod>();

    set(method: PaymentMethod) {
        this.valueChange.emit(method);
    }

    protected readonly PaymentMethod = PaymentMethod;
}
