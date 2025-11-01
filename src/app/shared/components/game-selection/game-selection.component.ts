import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Game} from '../../../models/game.model';
import {GameCardComponent} from "../game-card/game-card.component";

export type RoomSelection = { game: Game | null; playerCount: number };

@Component({
    selector: 'app-game-selection',
    standalone: true,
    imports: [CommonModule, GameCardComponent],
    templateUrl: './game-selection.component.html',
    styleUrls: ['./game-selection.component.scss']
})
export class GameSelectionComponent {
    @Input({required: true}) games: Game[] = [];
    @Input({required: true}) selectedRooms = 1;
    @Input({required: true}) selected: RoomSelection[] = [];

    @Output() selectGame = new EventEmitter<{ roomIndex: number; game: Game }>();

    trackByCode = (_: number, g: Game) => g.code;

    roomIndexes(): number[] {
        return Array.from({length: this.selectedRooms}, (_, i) => i);
    }

    isSelected(g: Game, roomIndex: number): boolean {
        return this.selected?.[roomIndex]?.game?.code === g.code;
    }

    onChoose(roomIndex: number, g: Game) {
        this.selectGame.emit({roomIndex, game: g});
    }
}
