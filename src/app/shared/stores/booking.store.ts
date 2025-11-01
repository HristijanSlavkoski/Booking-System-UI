import {computed, Injectable, signal} from '@angular/core';
import {Game} from '../../models/game.model';
import {Tier} from '../../models/config.model';

export type PaymentMethod = 'ONLINE' | 'CASH' | null;
export type RoomSelection = { game: Game | null; playerCount: number };

@Injectable({providedIn: 'root'})
export class BookingStore {
    // Core selection
    selectedDate = signal<string>('');      // ISO string or your current format
    selectedTime = signal<string>('');      // "HH:mm"
    selectedRooms = signal<number>(1);
    selectedGames = signal<RoomSelection[]>([]); // one per room

    // Games listing (optional cache)
    games = signal<Game[]>([]);
    maxConcurrentBookings = signal<number>(2);

    // Pricing config
    tiers = signal<Tier[]>([]);
    weekendMultiplier = signal<number>(1.0);
    holidayMultiplier = signal<number>(1.0);
    holidays = signal<string[]>([]);        // ISO dates 'YYYY-MM-DD'
    taxPercentage = signal<number>(0);

    // Customer + payment
    paymentMethod = signal<PaymentMethod>('CASH');
    customerInfo = signal({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });

    // --- helpers ---
    private isoOnly = (s: string): string => s?.split('T')?.[0] ?? s ?? '';

    private isWeekend(d: Date): boolean {
        const day = d.getDay(); // 0 Sun, 6 Sat
        return day === 0 || day === 6;
    }

    private isHolidayISO(iso: string): boolean {
        return this.holidays().includes(iso);
    }

    /** price-per-person (VAT included in tier), with weekend/holiday multipliers */
    pricePerPersonInclVat = (nPlayers: number): number => {
        if (!nPlayers) return 0;
        const t = this.tiers().find(tt => nPlayers >= tt.minPlayers && nPlayers <= tt.maxPlayers);
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

    totalPlayers = computed(() =>
        this.selectedGames().reduce((sum, r) => sum + (r.playerCount || 0), 0)
    );

    isCustomerValid = computed(() => {
        const c = this.customerInfo();
        return !!c.firstName && !!c.lastName && !!c.email && !!c.phone;
    });

    // --- mutators used by components ---
    setRooms(n: number) {
        const prev = this.selectedGames();
        const next: RoomSelection[] = Array.from({length: n}, (_, i) => ({
            game: prev[i]?.game ?? prev[0]?.game ?? null,
            playerCount: prev[i]?.playerCount ?? 0
        }));
        this.selectedRooms.set(n);
        this.selectedGames.set(next);
    }

    setGameForRoom(roomIndex: number, game: Game | null) {
        const arr = this.selectedGames().slice();
        const prev = arr[roomIndex] ?? {game: null, playerCount: 0};
        arr[roomIndex] = {game, playerCount: prev.playerCount};
        this.selectedGames.set(arr);
    }

    setPlayersForRoom(roomIndex: number, players: number) {
        const arr = this.selectedGames().slice();
        if (arr[roomIndex]) arr[roomIndex].playerCount = players;
        this.selectedGames.set(arr);
    }

    setDateTime(date: string, time: string) {
        this.selectedDate.set(date);
        this.selectedTime.set(time);
    }
}
