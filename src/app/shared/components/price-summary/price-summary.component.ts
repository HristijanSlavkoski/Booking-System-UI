import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslatePipe} from "@ngx-translate/core";

@Component({
    selector: 'app-price-summary',
    standalone: true,
    imports: [CommonModule, TranslatePipe],
    templateUrl: './price-summary.component.html',
    styleUrls: ['./price-summary.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriceSummaryComponent {
    /** Numbers should arrive already computed from parent */
    @Input() net: number = 0;
    @Input() vat: number = 0;
    @Input() total: number = 0;
    @Input() taxPercent: number = 0;

    /** Optional UI knobs */
    @Input() currency: string = 'MKD';
    @Input() showSubtotal: boolean = true;
    @Input() showBreakdown: boolean = true;
    @Input() compact: boolean = false;
}
