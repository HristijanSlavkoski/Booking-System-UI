// shared/stores/booking.store.ts
import {computed, Injectable, signal} from '@angular/core';
import {Game} from '../../models/game.model';
import {Tier} from '../../models/config.model';

export type PaymentMethod = 'ONLINE' | 'CASH' | null;
export type RoomSelection = { game: Game | null; playerCount: number };

@Injectable({providedIn: 'root'})
export class BookingStore {
    // Core selection
    selectedDate = signal<string>('');
    selectedTime = signal<string>('');
    selectedRooms = signal<number>(1);
    selectedGames = signal<RoomSelection[]>([]);

    // Games cache / system config
    games = signal<Game[]>([]);
    maxConcurrentBookings = signal<number>(2);

    // Pricing (no multipliers anymore)
    tiers = signal<Tier[]>([]);
    taxPercentage = signal<number>(0);

    // Customer + payment
    paymentMethod = signal<PaymentMethod>('CASH');
    customerInfo = signal({firstName: '', lastName: '', email: '', phone: ''});

    // --- API from APP_INITIALIZER
    setPricingConfig(tiers: Tier[], taxPct: number, maxConc: number) {
        this.tiers.set(tiers ?? []);
        this.taxPercentage.set(Number.isFinite(taxPct) ? taxPct : 0);
        this.maxConcurrentBookings.set(Number.isFinite(maxConc) ? maxConc : 2);
    }

    /** price-per-person (VAT included). No weekend/holiday multipliers. */
    pricePerPersonInclVat = (nPlayers: number): number => {
        if (!nPlayers) return 0;
        const t = this.tiers().find(tt => nPlayers >= tt.minPlayers && nPlayers <= tt.maxPlayers);
        return t ? Number(t.pricePerPlayer) || 0 : 0;
    };

    roomTotalInclVat = (roomIndex: number): number => {
        const r = this.selectedGames()[roomIndex];
        if (!r || !r.game || r.playerCount <= 0) return 0;
        return r.playerCount * this.pricePerPersonInclVat(r.playerCount);
    };

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

    // Mutators
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

    setDateTime(date: string, time: string) {
        this.selectedDate.set(date);
        this.selectedTime.set(time);
    }
}
