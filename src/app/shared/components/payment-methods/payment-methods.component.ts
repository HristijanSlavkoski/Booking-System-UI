import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';

type PaymentMethod = 'ONLINE' | 'CASH';

@Component({
    selector: 'app-payment-methods',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './payment-methods.component.html',
    styleUrls: ['./payment-methods.component.scss']
})
export class PaymentMethodsComponent {
    @Input() value: PaymentMethod | null = null;
    @Output() valueChange = new EventEmitter<PaymentMethod>();

    set(method: PaymentMethod) {
        this.valueChange.emit(method);
    }
}
