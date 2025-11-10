import {Component, computed, EventEmitter, inject, OnInit, Output, signal,} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import {GameService} from '../../core/services/game.service';
import {BookingService} from '../../core/services/booking.service';
import {AuthService} from '../../core/services/auth.service';
import {NotificationService} from '../../core/services/notification.service';
import {ConfigService} from '../../core/services/config.service';

import {Game} from '../../models/game.model';
import {PaymentMethod} from '../../models/booking.model';

import {ButtonComponent} from '../../shared/components/button/button.component';
import {LoadingComponent} from '../../shared/components/loading/loading.component';
import {CalendarComponent} from '../../shared/components/calendar/calendar.component';
import {GameSelectionComponent} from "../../shared/components/game-selection/game-selection.component";
import {BookingStore} from "../../shared/stores/booking.store";
import {PaymentStepComponent} from "../../shared/components/payment-step/payment-step.component";
import {RoomSummary} from "../../shared/components/booking-summary/booking-summary.component";
import {BookingSubmitService} from "../../shared/services/booking-submit.service";

type RoomSelection = { game: Game | null; playerCount: number };

@Component({
    selector: 'app-booking',
    standalone: true,
    imports: [CommonModule, FormsModule, LoadingComponent, CalendarComponent, ButtonComponent, GameSelectionComponent, PaymentStepComponent],
    templateUrl: './booking.component.html',
    styleUrls: ['./booking.component.scss'],
})
export class BookingComponent implements OnInit {
    @Output() back = new EventEmitter<void>();

    // services
    private gameService = inject(GameService);
    private bookingService = inject(BookingService);
    private authService = inject(AuthService);
    private notify = inject(NotificationService);
    private configService = inject(ConfigService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private submitter = inject(BookingSubmitService);
    // TODO: Make store private
    store = inject(BookingStore);


    // ui state
    loading = signal(false);
    submitting = signal(false);
    currentStep = signal<1 | 2 | 3 | 4>(1);

    // data
    games = signal<Game[]>([]);
    maxConcurrentBookings = signal(2);

    // selection (signals)
    selectedDate = signal<string>('');
    selectedTime = signal<string>('');
    selectedRooms = signal<number>(1);
    selectedGames = signal<RoomSelection[]>([]); // [{ game: Game|null, playerCount }]

    // customer
    paymentMethod: PaymentMethod = PaymentMethod.IN_PERSON;

    private clearGameSelection(opts: { clearPlayers?: boolean } = {}) {
        const {clearPlayers = true} = opts;
        const cleared = this.selectedGames().map(r => ({
            game: null,
            playerCount: clearPlayers ? 0 : r.playerCount
        }));
        this.selectedGames.set(cleared);
    }

    totalInclVat = computed(() => this.store.finalTotalInclVat());
    vatPortion = computed(() => this.store.vatPortion());
    netPortion = computed(() => this.store.netPortion());
    taxPercentage = computed(() => this.store.taxPercentage());

    pricePerPersonFor(n: number): number {
        return this.store.pricePerPersonInclVat(n);
    }

    // ------- lifecycle -------
    ngOnInit(): void {
        const qp = this.route.snapshot.queryParamMap;
        const stepQP = qp.get('step'); // "booking" | "payment" | null

        this.loading.set(true);

        // 2) read query params early
        const date = qp.get('date') || '';
        const time = qp.get('time') || '';
        const rooms = Number(qp.get('rooms') ?? 1);
        const gameCodeFromQP = qp.get('gameId') || '';
        const playersQP = qp.get('players');

        if (date) this.selectedDate.set(date);
        if (time) this.selectedTime.set(time);
        this.selectedRooms.set(rooms > 0 ? rooms : 1);

        // build rooms array (temporary, game resolved after games load)
        const baseRooms: RoomSelection[] = Array.from({length: this.selectedRooms()}, () => ({
            game: null,
            playerCount: 0,
        }));
        this.selectedGames.set(baseRooms);

        if (playersQP) {
            const p = parseInt(playersQP, 10);
            if (!Number.isNaN(p) && p > 0) {
                const updated = [...this.selectedGames()];
                if (updated[0]) updated[0] = {game: updated[0].game, playerCount: p};
                this.selectedGames.set(updated);
            }
        }

        this.syncAllToStore();

        // 3) load active games, then resolve gameId ONCE (no infinite loop)
        this.gameService.getActiveGames().subscribe({
            next: (list) => {
                this.games.set(list);
                if (gameCodeFromQP) this.resolveGameFromQP(gameCodeFromQP);
            },
            error: () => this.games.set([]),
            complete: () => this.loading.set(false),
        });

        // 4) user info (prefill)
        const user = this.authService.getCurrentUser?.();
        if (user) {
            this.store.setCustomerInfo({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
            });
        }

        const hasDateTime = !!(this.selectedDate() && this.selectedTime());
        const firstRoom = this.selectedGames()[0];
        const hasGame = !!firstRoom?.game;
        const hasPlayers = !!firstRoom?.playerCount;

        if (hasDateTime && hasGame && hasPlayers) this.currentStep.set(3);
        else if (hasDateTime) this.currentStep.set(hasGame ? 3 : 2);
        else this.currentStep.set(1);
    }

    private resolveGameFromQP(code: string): void {
        const g = this.games().find(x => x.code === code);
        if (!g) return; // if not found, don’t spin; keep UI usable

        const updated = [...this.selectedGames()];
        for (let i = 0; i < updated.length; i++) {
            updated[i] = {game: g, playerCount: updated[i].playerCount};
        }
        this.selectedGames.set(updated);

        this.syncRoomsToStore();
    }

    /** Push local date/time/rooms into the store (games/playerCounts are separate). */
    private syncHeaderToStore() {
        this.store.setDateTime(this.selectedDate(), this.selectedTime());
        this.store.setRooms(this.selectedRooms());
    }

    /** Push local room game+players into the store. */
    private syncRoomsToStore() {
        const arr = this.selectedGames();
        // assumes store already setRooms(selectedRooms())
        arr.forEach((r, i) => {
            this.store.setGameForRoom(i, r?.game ?? null);
            this.store.setPlayerCountForRoom(i, r?.playerCount ?? 0);
        });
    }

    /** Call this whenever local selection changes. */
    private syncAllToStore() {
        this.syncHeaderToStore();
        this.syncRoomsToStore();
    }

    // ------- ui helpers -------
    calendarGameCode = computed(() => this.selectedGames()[0]?.game?.code ?? '');

    formatDate(dateString: string): string {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-GB', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    }

    getRoomIndexes(): number[] {
        return Array.from({length: this.selectedRooms()}, (_, i) => i);
    }

    selectGameForRoom(game: Game, roomIndex: number): void {
        const updated = [...this.selectedGames()];
        const prev = updated[roomIndex] ?? {game: null, playerCount: 0};
        updated[roomIndex] = {game, playerCount: prev.playerCount};
        this.selectedGames.set(updated);

        this.store.setGameForRoom(roomIndex, game);
    }

    allRoomsHaveGames(): boolean {
        const arr = this.selectedGames();
        for (let i = 0; i < this.selectedRooms(); i++) {
            if (!arr[i]?.game) return false;
        }
        return true;
    }

    playerOptionsForRoom(roomIndex: number): number[] {
        const g = this.selectedGames()[roomIndex]?.game;
        if (!g) return [];
        const out: number[] = [];
        for (let i = g.minPlayers; i <= g.maxPlayers; i++) out.push(i);
        return out;
    }

    getGameNameForRoom(roomIndex: number): string {
        const g = this.selectedGames()[roomIndex]?.game;
        return g?.name ?? 'No game selected';
    }

    getSelectedGamesText(): string {
        const names = this.selectedGames()
            .filter((r) => !!r.game)
            .map((r) => r.game!.name);

        if (names.length === 0) return 'None selected';
        if (names.length === 1) return names[0];
        const uniq = [...new Set(names)];
        if (uniq.length === 1) return `${uniq[0]} (${names.length}x)`;
        return names.join(', ');
    }

    getPlayersForRoom(roomIndex: number): number {
        return this.selectedGames()[roomIndex]?.playerCount ?? 0;
    }

    getTotalPlayers(): number {
        return this.store.totalPlayers();
    }

    selectPlayersForRoom(n: number, roomIndex: number) {
        const updated = [...this.selectedGames()];
        if (updated[roomIndex]) {
            updated[roomIndex].playerCount = n;
            this.selectedGames.set(updated);
        }

        this.store.setPlayerCountForRoom(roomIndex, n);
    }

    // steps
    nextStep(): void {
        const s = this.currentStep();
        this.currentStep.set((Math.min(4, s + 1) as 1 | 2 | 3 | 4));
        window.scrollTo(0, 0);
    }

    previousStep(): void {
        const s = this.currentStep();
        const to = Math.max(1, s - 1) as 1 | 2 | 3 | 4;
        if (to === 1) {
            this.clearGameSelection({clearPlayers: true});

            this.store.clearPlayers();
            this.selectedGames().forEach((_, i) => this.store.setGameForRoom(i, null));
        }
        this.currentStep.set(to);

        window.scrollTo(0, 0);
    }

    // calendar child (full-page flow)
    onSlotSelected(slot: { date: string; time: string; rooms: number }): void {
        this.selectedDate.set(slot.date);
        this.selectedTime.set(slot.time);
        this.selectedRooms.set(slot.rooms);

        // resize rooms and keep existing selections where possible
        const prev = this.selectedGames();
        const next: RoomSelection[] = Array.from({length: slot.rooms}, (_, i) => ({
            game: prev[i]?.game ?? prev[0]?.game ?? null,
            playerCount: 0,
        }));
        this.selectedGames.set(next);

        this.syncAllToStore();

        if (next[0]?.game) this.currentStep.set(3);
        else this.nextStep();
    }

    onGamePickRequested(e: { date: string; time: string }) {
        // user clicked a slot without preselected game
        this.selectedDate.set(e.date);
        this.selectedTime.set(e.time);
        this.selectedRooms.set(1);
        this.selectedGames.set([{game: null, playerCount: 0}]);

        this.syncAllToStore();

        this.currentStep.set(2);
        window.scrollTo(0, 0);
    }

    // validation for step 3 → step 4
    isStep3Valid(): boolean {
        const arr = this.selectedGames();
        return arr.length > 0 && arr.every(r => !!r.game && r.playerCount > 0);
    }

    cancel(): void {
        this.router.navigate(['/games']);
    }

    // ------- submit -------
    submitBooking(): void {
        if (!this.store.paymentMethod()) return;

        this.submitting.set(true);

        this.submitter.submitFromStore(this.store)
            .subscribe({
                next: (res) => {
                    // res is BookingDTO
                    if (res?.paymentUrl) {
                        // If inside an iframe, consider window.top?.location
                        window.location.assign(res.paymentUrl);
                        return;
                    }
                    // success without payment
                    this.store.clearAll();
                },
                error: (err) => {
                    this.submitting.set(false);
                    // show toast/log err
                    console.error('Booking error:', err);
                },
                complete: () => {
                    this.submitting.set(false);
                }
            });
    }

    getRoomSummaries(): RoomSummary[] {
        const sel = this.store.selectedGames();
        return sel.map(item => ({
            name: item?.game?.name ?? null,
            playerCount: item?.playerCount ?? 0,
        }));
    }
}
