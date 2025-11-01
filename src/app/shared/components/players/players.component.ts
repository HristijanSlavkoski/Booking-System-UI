import {Component, computed, inject, OnInit, signal, Input, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {GameService} from '../../../core/services/game.service';
import {Game} from '../../../models/game.model';
import {ButtonComponent} from '../button/button.component';
import { ConfigService } from '../../../core/services/config.service';
import {Tier} from "../../../models/config.model";
import {BookingStore} from "../../stores/booking.store";
import {PriceSummaryComponent} from "../price-summary/price-summary.component";

@Component({
    standalone: true,
    selector: 'app-players',
    imports: [CommonModule, FormsModule, ButtonComponent, TranslatePipe, PriceSummaryComponent],
    templateUrl: './players.component.html',
    styleUrls: ['./players.component.scss']
})
export class PlayersComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private gameService = inject(GameService);
    private i18n = inject(TranslateService);
    private configService = inject(ConfigService);

    /** If true, we’re rendered inline inside /calendar; parent will handle back */
    @Input() inline = false;

    /** Emit when inline back is pressed (parent decides how to clear URL/state) */
    @Output() back = new EventEmitter<void>();

    // from query params
    date = signal<string>('');
    time = signal<string>('');
    gameCode = signal<string>('');
    lang = signal<'en' | 'mk'>('en');

    // game & players
    game = signal<Game | null>(null);
    loading = signal<boolean>(true);
    players = signal<number | null>(null);

    minPlayers = computed(() => this.game()?.minPlayers ?? 1);
    maxPlayers = computed(() => this.game()?.maxPlayers ?? 6);

    store = inject(BookingStore);

    ngOnInit(): void {
        const qp = this.route.snapshot.queryParamMap;
        const p = qp.get('players');
        if (p && this.players() == null) {
            const n = parseInt(p, 10);
            if (!Number.isNaN(n)) this.players.set(n);
        }
        this.date.set(qp.get('date') ?? '');
        this.time.set(qp.get('time') ?? '');
        this.gameCode.set(qp.get('gameId') ?? '');
        this.lang.set((qp.get('lang') ?? 'en').toLowerCase() === 'mk' ? 'mk' : 'en');
        this.i18n.use(this.lang());

        // fetch game details if present
        const code = this.gameCode();
        if (code) {
            this.gameService.getGameByCode(code).subscribe({
                next: g => {
                    this.game.set(g);
                    this.loading.set(false);
                },
                error: () => {
                    this.game.set(null);
                    this.loading.set(false);
                }
            });
        } else {
            // if no gameId somehow, bounce back to calendar
            this.router.navigate(['/']);
        }
    }

    selectedTotalInclVat = computed(() => {
        const n = this.players();
        if (!n) return 0;
        return n * this.store.pricePerPersonInclVat(n);
    });
    selectedVatPortion = computed(() => {
        const total = this.selectedTotalInclVat();
        const vat = this.store.taxPercentage();
        return Math.round(total * (vat / (100 + vat)));
    });
    pricePerPersonInclVat = computed(() => this.store.pricePerPersonInclVat(this.players() ?? 0));
    selectedNetPortion = computed(() => this.selectedTotalInclVat() - this.selectedVatPortion());
    taxPercentage = computed(() => this.store.taxPercentage());

    options(): number[] {
        const arr: number[] = [];
        for (let n = this.minPlayers(); n <= this.maxPlayers(); n++) arr.push(n);
        return arr;
    }

    selectPlayers(n: number) {
        this.players.set(n);
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {players: n},
            queryParamsHandling: 'merge',
        });
    }

    backToCalendar(): void {
        if (this.inline && this.back.observed) {
            // INLINE MODE: let parent do the param clearing and step switch
            this.back.emit();
            return;
        }
        // STANDALONE MODE (/players route): navigate to /calendar with only the params you want to keep
        this.router.navigate(['/calendar'], {
            queryParams: {
                lang: this.lang(),
                gameId: this.gameCode() || undefined
                // (omit date/time/players/step so they get dropped)
            }
        });
    }

    continueToBooking(): void {
        const q = {
            date: this.date(),
            time: this.time(),
            gameId: this.gameCode(),
            players: this.players(),
            rooms: 1,
            lang: this.lang(),
            step: 'booking' // 👈 key change
        };

        if (this.inline) {
            // Inline inside /calendar → just merge query params and flip step
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: q,
                queryParamsHandling: 'merge'
            });
            return;
        }

        this.router.navigate(['/booking'], { queryParams: q });
    }
}
