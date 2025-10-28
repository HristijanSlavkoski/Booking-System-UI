import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {CalendarComponent, SlotSelection} from '../../shared/components/calendar/calendar.component';
import {ConfigService} from '../../core/services/config.service';
import {GameService} from '../../core/services/game.service';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {Game} from '../../models/game.model';
import { PlayersComponent } from '../players/players.component';

@Component({
  selector: 'app-calendar-only',
  standalone: true,
  imports: [CommonModule, CalendarComponent, TranslatePipe, PlayersComponent],
  templateUrl: './calendar-only.component.html',
  styleUrls: ['./calendar-only.component.scss']
})
export class CalendarOnlyComponent implements OnInit {
    private router = inject(Router);
    public route = inject(ActivatedRoute);
    private configService = inject(ConfigService);
    private gameService = inject(GameService);
    private i18n = inject(TranslateService);

    maxConcurrentBookings = signal(2);
    gameId = signal<string>('');
    game = signal<Game | null>(null);
    lang = signal<'en' | 'mk'>('en');

    // picker UI
    showGamePicker = signal(false);
    games = signal<Game[]>([]);
    gamesLoading = signal(false);

    // slot that triggered the picker
    pendingSlot = signal<{ date: string; time: string } | null>(null);

    step = signal<'calendar' | 'players'>('calendar');

    private goToPlayersInline(date: string, time: string, gameCode: string) {
        // preserve params for deep-link/share
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {...this.route.snapshot.queryParams, date, time, gameId: gameCode, step: 'players'},
            queryParamsHandling: 'merge',
        });
        this.pendingSlot.set({date, time});
        this.step.set('players');
    }

    ngOnInit(): void {
        const qp = this.route.snapshot.queryParamMap;
        const lang = (qp.get('lang') || qp.get('locale') || 'en').toLowerCase();
        this.lang.set(lang === 'mk' ? 'mk' : 'en');
        this.i18n.use(this.lang());

        const gid = qp.get('gameId') ?? '';
        this.gameId.set(gid);

        if (gid) {
            this.gameService.getGameByCode(gid).subscribe({
                next: (g) => this.game.set(g),
                error: () => this.game.set(null),
            });
        }

        this.configService.loadConfig().subscribe({
            next: (config) => this.maxConcurrentBookings.set(config.maxConcurrentBookings)
        });

        const step = (qp.get('step') ?? 'calendar') as 'calendar' | 'players';
        this.step.set(step === 'players' ? 'players' : 'calendar');
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

    /** When a slot is clicked with NO game selected -> open the picker */
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

    closeGamePicker(): void {
        this.showGamePicker.set(false);
    }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const d = new Date(dateString);
    // Localize as you prefer (you already keep lang())
    const locale = this.lang() === 'mk' ? 'mk-MK' : 'en-GB';
    return d.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }
}
