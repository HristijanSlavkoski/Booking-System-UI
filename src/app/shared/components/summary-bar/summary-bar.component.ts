// summary-bar.component.ts
import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-summary-bar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './summary-bar.component.html',
    styleUrls: ['./summary-bar.component.scss']
})
export class SummaryBarComponent {
    @Input() date!: string | Date | null;
    @Input() time!: string | null;
    @Input() rooms!: number | null;
    @Input() gamesText = '';
    @Input() totalPlayers!: number | null;
}
