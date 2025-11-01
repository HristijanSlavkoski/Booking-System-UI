import {Component, computed, EventEmitter, inject, Input, OnInit, Output, signal,} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import {GameService} from '../../core/services/game.service';
import {BookingService} from '../../core/services/booking.service';
import {AuthService} from '../../core/services/auth.service';
import {NotificationService} from '../../core/services/notification.service';
import {ConfigService} from '../../core/services/config.service';

import {Game} from '../../models/game.model';
import {BookingRequest, PaymentMethod} from '../../models/booking.model';
import {Tier} from '../../models/config.model';

import {ButtonComponent} from '../../shared/components/button/button.component';
import {LoadingComponent} from '../../shared/components/loading/loading.component';
import {CalendarComponent} from '../../shared/components/calendar/calendar.component';
import {GameSelectionComponent} from "../../shared/components/game-selection/game-selection.component";

type RoomSelection = { game: Game | null; playerCount: number };

@Component({
    selector: 'app-booking',
    standalone: true,
    imports: [CommonModule, FormsModule, LoadingComponent, CalendarComponent, ButtonComponent, GameSelectionComponent],
    templateUrl: './booking.component.html',
    styleUrls: ['./booking.component.scss'],
})
export class BookingComponent implements OnInit {
    @Input() embedded = false;
    @Output() back = new EventEmitter<void>();

    // services
    private gameService = inject(GameService);
    private bookingService = inject(BookingService);
    private authService = inject(AuthService);
    private notify = inject(NotificationService);
    private configService = inject(ConfigService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

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

    // pricing config (same logic as PlayersComponent)
    tiers = signal<Tier[]>([]);
    weekendMultiplier = signal<number>(1.0);
    holidayMultiplier = signal<number>(1.0);
    holidays = signal<string[]>([]); // ISO 'YYYY-MM-DD'
    taxPercentage = signal<number>(0);

    // customer
    paymentMethod: PaymentMethod = PaymentMethod.CASH;
    customerInfo = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    };

    // ------- helpers (pricing/date) -------
    private isWeekend(d: Date): boolean {
        const day = d.getDay(); // 0 Sun, 6 Sat
        return day === 0 || day === 6;
    }
    private isoOnly(s: string): string {
        return s?.split('T')?.[0] ?? s ?? '';
    }
    private isHolidayISO(iso: string): boolean {
        return this.holidays().includes(iso);
    }
    private clearGameSelection(opts: { clearPlayers?: boolean } = {}) {
        const { clearPlayers = true } = opts;
        const cleared = this.selectedGames().map(r => ({
            game: null,
            playerCount: clearPlayers ? 0 : r.playerCount
        }));
        this.selectedGames.set(cleared);
    }

    /** price-per-person (VAT included in tier), with weekend/holiday multipliers */
    pricePerPersonInclVat = (nPlayers: number): number => {
        if (!nPlayers) return 0;
        const t = this.tiers().find((tt) => nPlayers >= tt.minPlayers && nPlayers <= tt.maxPlayers);
        if (!t) return 0;

        let gross = Number(t.pricePerPlayer) || 0;
        let mult = 1.0;

        const ds = this.selectedDate();
        if (ds) {
            const d = new Date(ds);
            if (this.isWeekend(d)) mult *= this.weekendMultiplier();
            if (this.isHolidayISO(this.isoOnly(ds))) mult *= this.holidayMultiplier();
        }
        return Math.round(gross * mult);
    };

    /** per-room total (VAT-incl) */
    roomTotalInclVat = (roomIndex: number): number => {
        const r = this.selectedGames()[roomIndex];
        if (!r || !r.game || r.playerCount <= 0) return 0;
        return r.playerCount * this.pricePerPersonInclVat(r.playerCount);
    };

    /** booking total (VAT-incl) */
    totalInclVat = computed(() =>
        this.selectedGames().reduce((sum, _, i) => sum + this.roomTotalInclVat(i), 0)
    );

    /** VAT portion out of VAT-incl total */
    vatPortion = computed(() => {
        const total = this.totalInclVat();
        const vat = this.taxPercentage() || 0;
        return Math.round(total * (vat / (100 + vat)));
    });

    /** net portion (excl. VAT) */
    netPortion = computed(() => this.totalInclVat() - this.vatPortion());

    // ------- lifecycle -------
    ngOnInit(): void {
        const qp = this.route.snapshot.queryParamMap;
        const stepQP = qp.get('step'); // "booking" | "payment" | null

        // ✅ DO NOT return here in embedded mode
        // if embedded, we’ll just decide which step to show, but still load data.
        this.loading.set(true);

        // 1) config (pricing etc.)
        this.configService.loadConfig().subscribe({
            next: (cfg) => {
                const pc = cfg?.pricingConfig;
                this.weekendMultiplier.set(Number(pc?.weekendMultiplier ?? 1.0));
                this.holidayMultiplier.set(Number(pc?.holidayMultiplier ?? 1.0));

                const rawTiers = Array.isArray(pc?.tiers) ? pc!.tiers! : [];
                this.tiers.set(rawTiers.map(t => ({
                    minPlayers: Number(t.minPlayers),
                    maxPlayers: Number(t.maxPlayers),
                    pricePerPlayer: Number(t.pricePerPlayer),
                })));

                this.holidays.set((cfg?.holidays ?? []).map((h: any) => h.date));
                this.taxPercentage.set(Number((cfg as any)?.taxPercentage ?? 0));
                this.maxConcurrentBookings.set(Number(cfg?.maxConcurrentBookings ?? 2));
            },
            error: () => {}
        });

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
        const baseRooms: RoomSelection[] = Array.from({ length: this.selectedRooms() }, () => ({
            game: null,
            playerCount: 0,
        }));
        this.selectedGames.set(baseRooms);

        if (playersQP) {
            const p = parseInt(playersQP, 10);
            if (!Number.isNaN(p) && p > 0) {
                const updated = [...this.selectedGames()];
                if (updated[0]) updated[0] = { game: updated[0].game, playerCount: p };
                this.selectedGames.set(updated);
            }
        }

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
            this.customerInfo.firstName = user.firstName;
            this.customerInfo.lastName = user.lastName;
            this.customerInfo.email = user.email;
            this.customerInfo.phone = user.phone;
        }

        // 5) decide step
        if (this.embedded) {
            // calendar-only iframe flow uses ?step=booking|payment
            if (stepQP === 'payment') this.currentStep.set(4);
            else this.currentStep.set(3); // default embedded landing
        } else {
            const hasDateTime = !!(this.selectedDate() && this.selectedTime());
            const firstRoom = this.selectedGames()[0];
            const hasGame = !!firstRoom?.game;
            const hasPlayers = !!firstRoom?.playerCount;

            if (hasDateTime && hasGame && hasPlayers) this.currentStep.set(3);
            else if (hasDateTime) this.currentStep.set(hasGame ? 3 : 2);
            else this.currentStep.set(1);
        }
    }

    private resolveGameFromQP(code: string): void {
        const g = this.games().find(x => x.code === code);
        if (!g) return; // if not found, don’t spin; keep UI usable

        const updated = [...this.selectedGames()];
        for (let i = 0; i < updated.length; i++) {
            updated[i] = { game: g, playerCount: updated[i].playerCount };
        }
        this.selectedGames.set(updated);
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
        return Array.from({ length: this.selectedRooms() }, (_, i) => i);
    }

    selectGameForRoom(game: Game, roomIndex: number): void {
        const updated = [...this.selectedGames()];
        const prev = updated[roomIndex] ?? { game: null, playerCount: 0 };
        updated[roomIndex] = { game, playerCount: prev.playerCount };
        this.selectedGames.set(updated);
    }

    isGameSelected(game: Game, roomIndex: number): boolean {
        return this.selectedGames()[roomIndex]?.game?.code === game.code;
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
        return this.selectedGames().reduce((sum, r) => sum + (r.playerCount || 0), 0);
    }

    selectPlayersForRoom(n: number, roomIndex: number) {
        const updated = [...this.selectedGames()];
        if (updated[roomIndex]) {
            updated[roomIndex].playerCount = n;
            this.selectedGames.set(updated);
        }
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
            this.clearGameSelection({ clearPlayers: true });
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
        const next: RoomSelection[] = Array.from({ length: slot.rooms }, (_, i) => ({
            game: prev[i]?.game ?? prev[0]?.game ?? null,
            playerCount: 0,
        }));
        this.selectedGames.set(next);

        if (next[0]?.game) this.currentStep.set(3);
        else this.nextStep();
    }

    onGamePickRequested(e: { date: string; time: string }) {
        // user clicked a slot without preselected game
        this.selectedDate.set(e.date);
        this.selectedTime.set(e.time);
        this.selectedRooms.set(1);
        this.selectedGames.set([{ game: null, playerCount: 0 }]);
        this.currentStep.set(2);
        window.scrollTo(0, 0);
    }

    // validation for step 3 → step 4
    isStep3Valid(): boolean {
        const arr = this.selectedGames();
        const roomsValid = arr.length > 0 && arr.every((r) => !!r.game && r.playerCount > 0);
        const userValid =
            !!this.customerInfo.firstName &&
            !!this.customerInfo.lastName &&
            !!this.customerInfo.email &&
            !!this.customerInfo.phone;
        return roomsValid && userValid;
    }

    cancel(): void {
        this.router.navigate(['/games']);
    }

    onBackClick() {
        // if you ever want to do local cleanup, do it here first
        this.back.emit();
    }

    // ------- submit -------
    submitBooking(): void {
        const gamesPayload = this.selectedGames().map((r, idx) => ({
            // if backend expects 'code', use code; if it expects UUID id, flip here:
            gameId: r.game?.id ?? '',
            roomNumber: idx + 1,
            playerCount: r.playerCount,
            // optional preview price per room (backend is source of truth anyway)
            price: this.roomTotalInclVat(idx),
        }));

        const request: BookingRequest = {
            bookingDate: this.selectedDate(),
            bookingTime: this.selectedTime(),
            numberOfRooms: this.selectedRooms(),
            totalPrice: this.totalInclVat(), // preview; backend should recompute
            paymentMethod: this.paymentMethod,
            customerFirstName: this.customerInfo.firstName,
            customerLastName: this.customerInfo.lastName,
            customerEmail: this.customerInfo.email,
            customerPhone: this.customerInfo.phone,
            games: gamesPayload,
        };

        this.submitting.set(true);
        this.bookingService.createBooking(request).subscribe({
            next: (res: any) => {
                this.notify.success('Booking created successfully!');
                if (res?.paymentUrl) {
                    window.location.href = res.paymentUrl;
                } else {
                    if (this.embedded){
                        this.router.navigate(['/calendar']);
                    }
                    else {
                        // TODO: if authenticated, go to my-booking, else home?
                        this.router.navigate(['/my-booking']);
                    }
                }
                this.submitting.set(false);
            },
            error: (err) => {
                console.error('Booking error:', err);
                this.notify.error('Failed to create booking: ' + (err?.error?.error || 'Unknown error'));
                this.submitting.set(false);
            },
        });
    }
}
