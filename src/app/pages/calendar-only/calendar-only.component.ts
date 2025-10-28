import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {CalendarComponent, SlotSelection} from '../../shared/components/calendar/calendar.component';
import {ConfigService} from '../../core/services/config.service';
import {GameService} from '../../core/services/game.service';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {Game} from '../../models/game.model';
import {PlayersComponent} from '../players/players.component';
import {BookingComponent} from '../booking/booking.component';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {distinctUntilChanged, map} from "rxjs";

@Component({
    selector: 'app-calendar-only',
    standalone: true,
    imports: [CommonModule, CalendarComponent, TranslatePipe, PlayersComponent, BookingComponent],
    templateUrl: './calendar-only.component.html',
    styleUrls: ['./calendar-only.component.scss']
})
export class CalendarOnlyComponent implements OnInit {
    private router = inject(Router);
    public route = inject(ActivatedRoute);
    private configService = inject(ConfigService);
    private gameService = inject(GameService);
    private i18n = inject(TranslateService);
    private destroyRef = inject(DestroyRef);

    maxConcurrentBookings = signal(2);
    gameId = signal<string>('');
    game = signal<Game | null>(null);
    lang = signal<'en' | 'mk'>('en');

    showGamePicker = signal(false);
    games = signal<Game[]>([]);
    gamesLoading = signal(false);

    pendingSlot = signal<{ date: string; time: string } | null>(null);
    step = signal<'calendar' | 'players' | 'booking'>('calendar');

    /** Utility: remove specific query params */
    private removeQueryParams(keys: string[]) {
        const qp: any = {};
        keys.forEach(k => qp[k] = null); // null -> remove
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: qp,
            queryParamsHandling: 'merge',
        });
    }

    /** Back from PLAYERS to CALENDAR, clear date/time/players/step */
    backToCalendar() {
        this.step.set('calendar');
        this.removeQueryParams(['date', 'time', 'players', 'step']);
        // keep gameId if you want the chip to remain; otherwise also clear it
        // this.removeQueryParams(['gameId']);
    }

    clearGameFromParent(): void {
        this.game.set(null);
        this.gameId.set('');
        // also clear dependent params so the UI is consistent
        this.removeQueryParams(['gameId', 'date', 'time', 'players', 'step']);
        // ensure we’re back on the calendar step
        this.step.set('calendar');
    }

    backToPlayers() {
        this.step.set('players');
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {step: 'players'},
            queryParamsHandling: 'merge',
        });
    }

    /** Close modal safely (no navigation) */
    closeGamePicker(): void {
        this.showGamePicker.set(false);
        this.pendingSlot.set(null);
        // optional: also clear date/time if you had pre-filled them when opening the picker
        // this.removeQueryParams(['date','time']);
    }

    private goToPlayersInline(date: string, time: string, gameCode: string) {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {...this.route.snapshot.queryParams, date, time, gameId: gameCode, step: 'players'},
            queryParamsHandling: 'merge',
        });
        this.pendingSlot.set({date, time});
        this.step.set('players');
    }

    ngOnInit(): void {
        this.route.queryParamMap
            .pipe(
                map(pm => ({
                    step: (pm.get('step') as 'calendar' | 'players' | 'booking') ?? 'calendar',
                    gameId: pm.get('gameId') ?? '',
                    date: pm.get('date') ?? '',
                    time: pm.get('time') ?? '',
                })),
                // avoid noisy repeats
                distinctUntilChanged((a, b) =>
                    a.step === b.step && a.gameId === b.gameId && a.date === b.date && a.time === b.time
                ),
                takeUntilDestroyed(this.destroyRef) // ✅ pass the injected DestroyRef
            )
            .subscribe(({step, gameId}) => {
                this.step.set(step);
                this.gameId.set(gameId);

                if (gameId && this.game()?.code !== gameId) {
                    this.gameService.getGameByCode(gameId).subscribe({
                        next: g => this.game.set(g),
                        error: () => this.game.set(null),
                    });
                }
                if (!gameId) this.game.set(null);
            });
    }

    onSlotSelected(slot: SlotSelection) {
        const gid = this.gameId();
        if (gid) {
            this.goToPlayersInline(slot.date, slot.time, gid);
        } else {
            this.pendingSlot.set({date: slot.date, time: slot.time});
            this.openGamePicker();
        }
    }

    selectGame(g: Game) {
        this.gameId.set(g.code);
        this.game.set(g);
        this.showGamePicker.set(false);

        const ps = this.pendingSlot();
        const current = this.route.snapshot.queryParams;

        if (ps) {
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: {...current, date: ps.date, time: ps.time, gameId: g.code},
                queryParamsHandling: 'merge',
            });
            this.goToPlayersInline(ps.date, ps.time, g.code);
            this.pendingSlot.set(null);
        }
    }

    onGamePickRequested(e: { date: string; time: string }): void {
        this.pendingSlot.set({date: e.date, time: e.time});
        this.openGamePicker();
    }

    private openGamePicker(): void {
        this.showGamePicker.set(true);
        if (this.games().length === 0) {
            this.gamesLoading.set(true);
            this.gameService.getActiveGames().subscribe({
                next: (list) => {
                    this.games.set(list);
                    this.gamesLoading.set(false);
                },
                error: () => {
                    this.games.set([]);
                    this.gamesLoading.set(false);
                }
            });
        }
    }

    formatDate(dateString: string): string {
        if (!dateString) return '';
        const d = new Date(dateString);
        const locale = this.lang() === 'mk' ? 'mk-MK' : 'en-GB';
        return d.toLocaleDateString(locale, {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'});
    }
}
