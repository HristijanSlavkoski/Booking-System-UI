import {Component, computed, inject, OnInit, signal, Input, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {GameService} from '../../core/services/game.service';
import {Game} from '../../models/game.model';
import {ButtonComponent} from '../../shared/components/button/button.component';
import { ConfigService } from '../../core/services/config.service';
import {Tier} from "../../models/config.model";

@Component({
    standalone: true,
    selector: 'app-players',
    imports: [CommonModule, FormsModule, ButtonComponent, TranslatePipe],
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
    tiers = signal<Tier[]>([]);
    weekendMultiplier = signal<number>(1.0);
    holidayMultiplier = signal<number>(1.0);
    holidays = signal<string[]>([]); // ISO dates 'YYYY-MM-DD'
    taxPercentage = signal<number>(0);

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

        this.configService.loadConfig().subscribe({
            next: (cfg) => {
                const pc = cfg?.pricingConfig;

                // multipliers
                this.weekendMultiplier.set(Number(pc?.weekendMultiplier ?? 1.0));
                this.holidayMultiplier.set(Number(pc?.holidayMultiplier ?? 1.0));

                // tiers (guard for non-array)
                const rawTiers = Array.isArray(pc?.tiers) ? pc!.tiers! : [];
                this.tiers.set(rawTiers.map((t) => ({
                    minPlayers: Number(t.minPlayers),
                    maxPlayers: Number(t.maxPlayers),
                    pricePerPlayer: Number(t.pricePerPlayer),
                })));

                // holidays
                this.holidays.set((cfg?.holidays ?? []).map((h) => h.date));

                // tax: support both names during transition
                const tax =
                    (cfg as any)?.taxPercentage ??
                    0;
                this.taxPercentage.set(Number(tax));
            },
            error: () => { /* noop */ }
        });
    }

    /** Price per person (VAT already included in tier price), after weekend/holiday multipliers */
    pricePerPersonInclVat(n: number): number {
        const t = this.tiers().find(t => n >= t.minPlayers && n <= t.maxPlayers);
        if (!t) return 0;
        const baseGross = Number(t.pricePerPlayer); // already VAT-included from backend
        // apply multipliers client-side (preview). Backend will recompute authoritative price on booking.
        let mult = 1.0;
        if (this.date()) {
            const d = new Date(this.date());
            if (this.isWeekend(d)) mult *= this.weekendMultiplier();
            if (this.isHolidayISO(this.isoDate(this.date()))) mult *= this.holidayMultiplier();
        }
        return Math.round(baseGross * mult);
    }

    /** Total (VAT included) for selected players */
    selectedTotalInclVat = computed(() => {
        const n = this.players();
        if (!n) return 0;
        return n * this.pricePerPersonInclVat(n);
    });

    /** VAT portion of a VAT-included total: total * v/(100+v) */
    selectedVatPortion = computed(() => {
        const total = this.selectedTotalInclVat();
        const vat = this.taxPercentage() || 0;
        return Math.round(total * (vat / (100 + vat)));
    });

    /** Net portion (excl. VAT), for the breakdown */
    selectedNetPortion = computed(() => this.selectedTotalInclVat() - this.selectedVatPortion());


    private isWeekend(d: Date): boolean {
        const day = d.getDay(); // 0 Sun .. 6 Sat
        return day === 0 || day === 6;
    }
    private isHolidayISO(iso: string): boolean {
        return this.holidays().includes(iso);
    }
    private isoDate(s: string): string {
        // assume s is 'YYYY-MM-DD'
        return s?.split('T')[0] ?? '';
    }

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
