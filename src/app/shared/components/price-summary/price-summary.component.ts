import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-price-summary',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './price-summary.component.html',
    styleUrls: ['./price-summary.component.scss']
})
export class PriceSummaryComponent {
    @Input() net = 0;
    @Input() vat = 0;
    @Input() taxPercent = 18;
    @Input() total = 0;
}
