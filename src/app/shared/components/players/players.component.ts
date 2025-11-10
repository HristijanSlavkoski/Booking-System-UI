import {Component, computed, EventEmitter, inject, Input, OnInit, Output, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {GameService} from '../../../core/services/game.service';
import {Game} from '../../../models/game.model';
import {ButtonComponent} from '../button/button.component';
import {ConfigService} from '../../../core/services/config.service';
import {BookingStore} from "../../stores/booking.store";
import {PriceSummaryComponent} from "../price-summary/price-summary.component";
import {PricingPreview, PricingService} from "../../../core/services/pricing.service";

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
    private pricingService = inject(PricingService);

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

    promotionDiscount = signal<number>(0);      // 0..1
    promotionName = signal<string | null>(null);
    promotionLoading = signal<boolean>(false);
    promotionError = signal<string | null>(null);

    store = inject(BookingStore);

    ngOnInit(): void {
        const qp = this.route.snapshot.queryParamMap;
        const p = qp.get('players');
        if (p && this.players() == null) {
            const n = parseInt(p, 10);
            if (!Number.isNaN(n)) this.players.set(n);
            this.syncPlayersToStore(n);
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
                    this.loadPromotionMeta();
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

    // base total (without promo), using your existing store tier logic
    baseTotalForPlayers = computed(() => {
        const n = this.players();
        if (!n) return 0;
        return n * this.store.pricePerPersonInclVat(n);
    });

    // final total incl. VAT with promotion applied
    selectedTotalInclVat = computed(() => {
        const base = this.baseTotalForPlayers();
        const disc = this.promotionDiscount();
        if (!base) return 0;
        return Math.round(base * (1 - disc));
    });

    pricePerPersonInclVat = computed(() => {
        const n = this.players();
        if (!n) return 0;
        const basePer = this.store.pricePerPersonInclVat(n);
        const disc = this.promotionDiscount();
        if (!basePer) return 0;
        return Math.round(basePer * (1 - disc));
    });

    selectedVatPortion = computed(() => {
        const total = this.selectedTotalInclVat();
        const vat = this.store.taxPercentage();
        if (!total || !vat) return 0;
        return Math.round(total * (vat / (100 + vat)));
    });

    selectedNetPortion = computed(() => {
        const total = this.selectedTotalInclVat();
        const vatPortion = this.selectedVatPortion();
        return total - vatPortion;
    });

    taxPercentage = computed(() => this.store.taxPercentage());

    promoPercent = computed(() => {
        const d = this.promotionDiscount();
        if (!d || d <= 0) return 0;
        return Math.round(d * 100);
    });

    options(): number[] {
        const arr: number[] = [];
        for (let n = this.minPlayers(); n <= this.maxPlayers(); n++) arr.push(n);
        return arr;
    }

    selectPlayers(n: number) {
        this.players.set(n);
        this.syncPlayersToStore(n);
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {players: n},
            queryParamsHandling: 'merge',
        });
    }

    private loadPromotionMeta() {
        const g = this.game();
        const date = this.date();

        if (!g || !g.id || !date) {
            return;
        }

        const playersForPreview = g.minPlayers ?? 2;

        this.promotionLoading.set(true);
        this.promotionError.set(null);

        this.pricingService.previewPrice(g.id, date, playersForPreview).subscribe({
            next: (preview: PricingPreview) => {
                const disc = preview.discountFraction || 0;
                const name = preview.promotionName || null;

                this.promotionDiscount.set(disc);
                this.promotionName.set(name);

                // 🔥 push into global store so other steps see it
                this.store.setPromotion(disc, name);

                this.promotionLoading.set(false);
            },
            error: err => {
                console.error('Failed to load promotion info', err);
                this.promotionDiscount.set(0);
                this.promotionName.set(null);
                this.store.clearPromotion();  // reset store promo as well
                this.promotionError.set('Failed to load promotion info');
                this.promotionLoading.set(false);
            }
        });
    }

    private syncPlayersToStore(n: number | null) {
        // assume inline flow is single-room for now
        this.store.setRooms(1);
        this.store.setPlayerCountForRoom(0, n ?? 0);

        // if we have the game loaded, ensure store has it too
        const g = this.game();
        if (g) this.store.setGameForRoom(0, g);
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
        const n = this.players();
        this.syncPlayersToStore(n);

        const q = {
            date: this.date(),
            time: this.time(),
            gameId: this.gameCode(),
            players: n,
            rooms: 1,
            lang: this.lang(),
            step: 'booking'
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

        this.router.navigate(['/booking'], {queryParams: q});
    }
}
