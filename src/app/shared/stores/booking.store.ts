// shared/stores/booking.store.ts
import {computed, Injectable, signal} from '@angular/core';
import {Game} from '../../models/game.model';
import {RoomSelection, Tier} from '../../models/config.model';
import {PaymentMethod} from '../../models/booking.model';

@Injectable({providedIn: 'root'})
export class BookingStore {
    // ─────────────────────────────────────────────────────────────────────────────
    // Core selection (flow state)
    // ─────────────────────────────────────────────────────────────────────────────
    selectedDate = signal<string>('');
    selectedTime = signal<string>('');
    selectedRooms = signal<number>(1);
    selectedGames = signal<RoomSelection[]>([]); // [{ game, playerCount }, ...]

    // ─────────────────────────────────────────────────────────────────────────────
    // Catalog / config cache
    // ─────────────────────────────────────────────────────────────────────────────
    games = signal<Game[]>([]);
    tiers = signal<Tier[]>([]);
    taxPercentage = signal<number>(0);
    maxConcurrentBookings = signal<number>(2);

    // Configure from APP_INITIALIZER (or admin)
    setPricingConfig(tiers: Tier[], taxPct: number, maxConc: number) {
        this.tiers.set(tiers ?? []);
        this.taxPercentage.set(Number.isFinite(taxPct) ? taxPct : 0);
        this.maxConcurrentBookings.set(Number.isFinite(maxConc) ? maxConc : 2);
    }

    setGames(list: Game[]) {
        this.games.set(list ?? []);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Customer + payment
    // ─────────────────────────────────────────────────────────────────────────────
    customerInfo = signal({firstName: '', lastName: '', email: '', phone: ''});

    // Keep a single source of truth for payment method (nullable until chosen)
    private _paymentMethod = signal<PaymentMethod | null>(PaymentMethod.ONLINE);

    paymentMethod() {
        return this._paymentMethod();
    }

    setPaymentMethod(m: PaymentMethod | null) {
        this._paymentMethod.set(m);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Pricing helpers (VAT included)
    // ─────────────────────────────────────────────────────────────────────────────
    /** Price per person (VAT included) based on tier brackets */
    pricePerPersonInclVat = (nPlayers: number): number => {
        if (!nPlayers) return 0;
        const t = this.tiers().find(tt => nPlayers >= tt.minPlayers && nPlayers <= tt.maxPlayers);
        return t ? Number(t.pricePerPlayer) || 0 : 0;
    };

    /** Total price of a single room (players * per-person, VAT included) */
    roomTotalInclVat = (roomIndex: number): number => {
        const r = this.selectedGames()[roomIndex];
        if (!r || !r.game || r.playerCount <= 0) return 0;
        return r.playerCount * this.pricePerPersonInclVat(r.playerCount);
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // Derived totals (signals)
    // ─────────────────────────────────────────────────────────────────────────────
    totalInclVat = computed(() =>
        this.selectedGames().reduce((sum, _, i) => sum + this.roomTotalInclVat(i), 0)
    );

    vatPortion = computed(() => {
        const total = this.totalInclVat();
        const vat = this.taxPercentage() || 0;
        return Math.round(total * (vat / (100 + vat)));
    });

    netPortion = computed(() => this.totalInclVat() - this.vatPortion());

    allRoomsHaveGames = computed(() =>
        this.selectedGames().length > 0 && this.selectedGames().every(r => !!r.game)
    );

    isCustomerValid = computed(() => {
        const c = this.customerInfo();
        return !!c.firstName && !!c.lastName && !!c.email && !!c.phone;
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // Aggregates / getters
    // ─────────────────────────────────────────────────────────────────────────────
    totalPlayers(): number {
        const sel = this.selectedGames();
        return sel.reduce((sum, r) => sum + (r?.playerCount ?? 0), 0);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Mutators
    // ─────────────────────────────────────────────────────────────────────────────
    setRooms(n: number) {
        const prev = this.selectedGames();
        const next: RoomSelection[] = Array.from({length: n}, (_, i) => ({
            game: prev[i]?.game ?? prev[0]?.game ?? null,
            playerCount: prev[i]?.playerCount ?? 0,
        }));
        this.selectedRooms.set(n);
        this.selectedGames.set(next);
    }

    setGameForRoom(i: number, game: Game | null) {
        const arr = this.selectedGames().slice();
        const prev = arr[i] ?? {game: null, playerCount: 0};
        arr[i] = {game, playerCount: prev.playerCount};
        this.selectedGames.set(arr);
    }

    setPlayerCountForRoom(i: number, count: number) {
        const arr = this.selectedGames().slice();
        const prev = arr[i] ?? {game: null, playerCount: 0};
        arr[i] = {game: prev.game, playerCount: Math.max(0, count | 0)};
        this.selectedGames.set(arr);
    }

    clearPlayers() {
        const arr = this.selectedGames().map(r => ({...r, playerCount: 0}));
        this.selectedGames.set(arr);
    }

    setDateTime(date: string, time: string) {
        this.selectedDate.set(date);
        this.selectedTime.set(time);
    }

    clearAll() {
        this.selectedDate.set('');
        this.selectedTime.set('');
        this.selectedRooms.set(1);
        this.selectedGames.set([]);
        this._paymentMethod.set(null);
        this.customerInfo.set({firstName: '', lastName: '', email: '', phone: ''});
    }
}
