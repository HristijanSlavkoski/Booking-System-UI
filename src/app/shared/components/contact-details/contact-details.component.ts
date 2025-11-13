import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Customer} from '../../../models/booking.model';
import {TranslatePipe} from "@ngx-translate/core";

@Component({
    selector: 'app-contact-details',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslatePipe],
    templateUrl: './contact-details.component.html',
    styleUrls: ['./contact-details.component.scss']
})
export class ContactDetailsComponent {
    @Input() customer!: Customer;
    @Output() customerChange = new EventEmitter<Customer>();
    /**
     * Optional, if parent wants to react live to validity changes.
     * Emits true/false whenever a field changes.
     */
    @Output() validChange = new EventEmitter<boolean>();

    onField<K extends keyof Customer>(key: K, value: string) {
        const next = {...this.customer, [key]: value};
        this.customerChange.emit(next);
        this.validChange.emit(this.isValid(next));
    }

    isValid(c: Customer): boolean {
        return !!(c.firstName && c.lastName && c.email && c.phone);
    }
}
