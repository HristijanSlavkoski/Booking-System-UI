import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {CalendarComponent, SlotSelection} from '../../shared/components/calendar/calendar.component';
import {GameService} from '../../core/services/game.service';
import {TranslatePipe} from '@ngx-translate/core';
import {Game} from '../../models/game.model';
import {PlayersComponent} from '../../shared/components/players/players.component';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {distinctUntilChanged, map} from "rxjs";
import {BookingStore} from '../../shared/stores/booking.store';
import {GameSelectionComponent} from "../../shared/components/game-selection/game-selection.component";
import {ButtonComponent} from "../../shared/components/button/button.component";
import {PaymentStepComponent} from "../../shared/components/payment-step/payment-step.component";
import {RoomSummary} from "../../shared/components/booking-summary/booking-summary.component";
import {SummaryBarComponent} from "../../shared/components/summary-bar/summary-bar.component";
import {BookingSubmitService} from "../../shared/services/booking-submit.service";

@Component({
    selector: 'app-calendar-only',
    standalone: true,
    imports: [CommonModule, CalendarComponent, TranslatePipe, PlayersComponent, GameSelectionComponent, ButtonComponent, PaymentStepComponent, SummaryBarComponent],
    templateUrl: './calendar-only.component.html',
    styleUrls: ['./calendar-only.component.scss']
})
export class CalendarOnlyComponent implements OnInit {
    private router = inject(Router);
    public route = inject(ActivatedRoute);
    private gameService = inject(GameService);
    private destroyRef = inject(DestroyRef);
    // TODO: Make store private
    store = inject(BookingStore);
    private submitter = inject(BookingSubmitService);

    maxConcurrentBookings = signal(2);
    gameId = signal<string>('');
    game = signal<Game | null>(null);
    lang = signal<'en' | 'mk'>('en');

    showGamePicker = signal(false);
    games = signal<Game[]>([]);
    gamesLoading = signal(false);

    pendingSlot = signal<{ date: string; time: string } | null>(null);
    step = signal<'calendar' | 'game' | 'players' | 'booking'>('calendar');

    submitting = signal(false);

    private removeQueryParams(keys: string[]) {
        const qp: any = {};
        keys.forEach(k => qp[k] = null);
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: qp,
            queryParamsHandling: 'merge',
        });
    }

    backToCalendar() {
        // Clear game everywhere
        this.game.set(null);
        this.gameId.set('');
        this.store.setGameForRoom(0, null);

        // Remove gameId from URL and go to calendar step
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {...this.route.snapshot.queryParams, step: 'calendar', gameId: null},
            queryParamsHandling: 'merge',
        });

        this.step.set('calendar');
    }


    backToGames() {
        this.ensureGamesLoaded();
        this.store.setRooms(Math.max(1, this.store.selectedRooms()));
        this.setStep('game');
    }

    backToPlayers() {
        this.setStep('players');
    }

    clearGameFromParent(): void {
        this.game.set(null);
        this.gameId.set('');
        this.store.setGameForRoom(0, null);
        this.removeQueryParams(['gameId', 'date', 'time', 'players', 'step']);
        this.step.set('calendar');
    }

    private setStep(step: 'calendar' | 'game' | 'players' | 'booking', extras: Record<string, any> = {}) {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {...this.route.snapshot.queryParams, step, ...extras},
            queryParamsHandling: 'merge',
        });
        this.step.set(step);
    }

    ngOnInit(): void {
        this.route.queryParamMap
            .pipe(
                map(pm => ({
                    step: (pm.get('step') as 'calendar' | 'game' | 'players' | 'booking') ?? 'calendar',
                    gameId: pm.get('gameId') ?? '',
                    date: pm.get('date') ?? '',
                    time: pm.get('time') ?? '',
                })),
                distinctUntilChanged((a, b) =>
                    a.step === b.step && a.gameId === b.gameId && a.date === b.date && a.time === b.time
                ),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(({step, gameId, date, time}) => {
                this.step.set(step);
                if (date || time) this.store.setDateTime(date, time);

                // keep store in sync with query
                if (gameId && this.game()?.code !== gameId) {
                    this.fetchGameByCode(gameId);
                }
                if (!gameId) {
                    this.game.set(null);
                    this.store.setGameForRoom(0, null);
                }

                // if we land on the game step, ensure games are loaded
                if (step === 'game' && this.games().length === 0) {
                    this.ensureGamesLoaded();
                }
            });
    }

    private fetchGameByCode(code: string) {
        this.gameService.getGameByCode(code).subscribe({
            next: g => {
                this.game.set(g);
                this.gameId.set(g.code);
                this.store.setRooms(1);
                this.store.setGameForRoom(0, g);
            },
            error: () => {
                this.game.set(null);
                this.gameId.set('');
                this.store.setGameForRoom(0, null);
            }
        });
    }

    private ensureGamesLoaded() {
        if (this.gamesLoading()) return;
        this.gamesLoading.set(true);
        this.gameService.getActiveGames().subscribe({
            next: list => {
                this.games.set(list);
                this.gamesLoading.set(false);
            },
            error: () => {
                this.games.set([]);
                this.gamesLoading.set(false);
            }
        });
    }

    onSlotSelected(slot: SlotSelection) {
        const gid = this.gameId();

        // always reflect date/time in store
        this.store.setDateTime(slot.date, slot.time);

        if (gid) {
            // already have a preselected game => go straight to players
            this.goToPlayersInline(slot.date, slot.time, gid);
        } else {
            // NEW: move to GAME step (inline game selection)
            this.store.setRooms(1);
            this.pendingSlot.set({date: slot.date, time: slot.time});

            // ensure games are loaded and navigate with step=game
            this.ensureGamesLoaded();
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: {...this.route.snapshot.queryParams, date: slot.date, time: slot.time, step: 'game'},
                queryParamsHandling: 'merge'
            });
            this.step.set('game');
        }
    }

    onGamePickRequested(e: { date: string; time: string }) {
        // TODO: Rooms to not be passed as 1
        this.onSlotSelected({date: e.date, time: e.time, rooms: 1});
    }

    private goToPlayersInline(date: string, time: string, gameCode: string) {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {...this.route.snapshot.queryParams, date, time, gameId: gameCode, step: 'players'},
            queryParamsHandling: 'merge'
        });
        this.step.set('players');
    }

    formatDate(dateString: string): string {
        if (!dateString) return '';
        const d = new Date(dateString);
        const locale = this.lang() === 'mk' ? 'mk-MK' : 'en-GB';
        return d.toLocaleDateString(locale, {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'});
    }

    // --- NEW: game-selection outputs
    onInlineSelectGame(e: { roomIndex: number; game: Game }) {
        // iframe flow is usually 1 room; but we support multiple anyway
        if (e.roomIndex === 0) {
            this.gameId.set(e.game.code);
            this.game.set(e.game);
        }
        this.store.setGameForRoom(e.roomIndex, e.game);
    }

    goToPlayersAfterGame() {
        const date = this.store.selectedDate();
        const time = this.store.selectedTime();
        const chosen = this.store.selectedGames()[0]?.game?.code;
        if (!date || !time || !chosen) return;

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {...this.route.snapshot.queryParams, date, time, gameId: chosen, step: 'players'},
            queryParamsHandling: 'merge'
        });
        this.step.set('players');
    }

    getTotalPlayers(): number {
        return this.store.totalPlayers();
    }

    getRoomSummaries(): RoomSummary[] {
        const sel = this.store.selectedGames();
        return sel.map(item => ({
            name: item?.game?.name ?? null,
            playerCount: item?.playerCount ?? 0,
        }));
    }

    getGamesText(): string {
        const names = this.store
            .selectedGames()
            .map(r => r?.game?.name ?? null)
            .filter((n): n is string => !!n); // 👈 narrows to string[]
        return names.join(', ');
    }

    submitBookingFromInline() {
        if (!this.store.paymentMethod()) return; // guard

        this.submitting.set(true);
        this.submitter.submitFromStore(this.store, {embedded: true})
            .subscribe({
                complete: () => this.submitting.set(false),
                error: () => this.submitting.set(false),
            });
    }
}
