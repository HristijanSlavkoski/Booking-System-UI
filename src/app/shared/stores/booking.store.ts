// shared/stores/booking.store.ts
import {computed, Injectable, signal} from '@angular/core';
import {Game} from '../../models/game.model';
import {RoomSelection, Tier} from '../../models/config.model';
import {Customer, PaymentMethod} from '../../models/booking.model';

@Injectable({providedIn: 'root'})
export class BookingStore {
    // ─────────────────────────────────────────────────────────────────────────────
    // Core selection (flow state)
    // ─────────────────────────────────────────────────────────────────────────────
    selectedDate = signal<string>('');
    selectedTime = signal<string>('');
    selectedRooms = signal<number>(1);
    selectedGames = signal<RoomSelection[]>([]); // [{ game, playerCount }, ...]
    lang = signal<string>('en');

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
    // Promotion (global for current flow)
    // ─────────────────────────────────────────────────────────────────────────────
    private _promotionDiscount = signal<number>(0);          // 0..1 (e.g. 0.5 = 50%)
    private _promotionName = signal<string | null>(null);

    promotionDiscount = computed(() => this._promotionDiscount());
    promotionName = computed(() => this._promotionName());

    promoPercent = computed(() => {
        const d = this._promotionDiscount();
        return d > 0 ? Math.round(d * 100) : 0;
    });

    setPromotion(discount: number, name: string | null) {
        this._promotionDiscount.set(discount || 0);
        this._promotionName.set(name ?? null);
    }

    clearPromotion() {
        this._promotionDiscount.set(0);
        this._promotionName.set(null);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Gift card (for current booking)
    // ─────────────────────────────────────────────────────────────────────────────
    private _giftCardCode = signal<string | null>(null);
    private _giftCardAmount = signal<number>(0); // MKD

    giftCardCode = computed(() => this._giftCardCode());
    giftCardAmount = computed(() => this._giftCardAmount());

    setGiftCard(code: string, amount: number) {
        this._giftCardCode.set(code || null);
        this._giftCardAmount.set(Number.isFinite(amount) ? amount : 0);
    }

    clearGiftCard() {
        this._giftCardCode.set(null);
        this._giftCardAmount.set(0);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Customer + payment
    // ─────────────────────────────────────────────────────────────────────────────
    customerInfo = signal({firstName: '', lastName: '', email: '', phone: ''});

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
        const t = this.tiers().find(
            (tt) => nPlayers >= tt.minPlayers && nPlayers <= tt.maxPlayers
        );
        return t ? Number(t.pricePerPlayer) || 0 : 0;
    };

    /** Total price of a single room (players * per-person, VAT included), before promo & giftcard */
    roomTotalInclVat = (roomIndex: number): number => {
        const r = this.selectedGames()[roomIndex];
        if (!r || !r.game || r.playerCount <= 0) return 0;
        return r.playerCount * this.pricePerPersonInclVat(r.playerCount);
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // Derived totals (signals)
    // ─────────────────────────────────────────────────────────────────────────────

    /** Base total (VAT included), BEFORE promotion */
    baseTotalInclVat = computed(() =>
        this.selectedGames().reduce((sum, _, i) => sum + this.roomTotalInclVat(i), 0)
    );

    /** Total after promotion, BEFORE gift card */
    promoTotalInclVat = computed(() => {
        const base = this.baseTotalInclVat();
        const disc = this._promotionDiscount();
        if (!base) return 0;
        return Math.round(base * (1 - disc));
    });

    /** Final total after promotion AND gift card */
    finalTotalInclVat = computed(() => {
        const promo = this.promoTotalInclVat();
        const gc = this._giftCardAmount();
        const total = promo - gc;
        return total > 0 ? total : 0;
    });

    vatPortion = computed(() => {
        const total = this.finalTotalInclVat();
        const vat = this.taxPercentage() || 0;
        return Math.round(total * (vat / (100 + vat)));
    });

    netPortion = computed(() => this.finalTotalInclVat() - this.vatPortion());

    allRoomsHaveGames = computed(
        () =>
            this.selectedGames().length > 0 &&
            this.selectedGames().every((r) => !!r.game)
    );

    openingTime = signal<string>('12:00');
    closingTime = signal<string>('22:00');
    slotDurationMinutes = signal<number>(60);

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

    resetPlayers(clearPayment = true) {
        const current = this.selectedGames();
        const cleared = current.map((r) => ({...r, playerCount: 0}));
        this.selectedGames.set(cleared);
        if (clearPayment) this.setPaymentMethod(null as any);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Mutators
    // ─────────────────────────────────────────────────────────────────────────────
    setRooms(n: number) {
        const prev = this.selectedGames();
        const next: RoomSelection[] = Array.from({length: n}, (_, i) => ({
            game: prev[i]?.game ?? prev[0]?.game ?? null,
            playerCount: prev[i]?.playerCount ?? 0
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
        const arr = this.selectedGames().map((r) => ({...r, playerCount: 0}));
        this.selectedGames.set(arr);
    }

    setDateTime(date: string, time: string) {
        this.selectedDate.set(date);
        this.selectedTime.set(time);
    }

    setLang(lang: string) {
        this.lang.set(lang);
    }

    clearAll() {
        this.selectedDate.set('');
        this.selectedTime.set('');
        this.selectedRooms.set(1);
        this.clearPlayers();
        this.selectedGames.set([]);
        this.resetCustomerInfo();
        this._paymentMethod.set(PaymentMethod.ONLINE);
        this.customerInfo.set({
            firstName: '',
            lastName: '',
            email: '',
            phone: ''
        });
        this.clearPromotion();
        this.clearGiftCard();
    }

    setCustomerInfo(info: Partial<{ firstName: string; lastName: string; email: string; phone: string }>) {
        this.customerInfo.set({...this.customerInfo(), ...info});
    }

    setCustomerField<K extends keyof Customer>(key: K, value: Customer[K]) {
        this.customerInfo.set({...this.customerInfo(), [key]: value});
    }

    resetCustomerInfo() {
        this.customerInfo.set({firstName: '', lastName: '', email: '', phone: ''});
    }

    setSystemHours(openHHmm: string, closeHHmm: string, slotMin: number) {
        this.openingTime.set(openHHmm || '12:00');
        this.closingTime.set(closeHHmm || '22:00');
        this.slotDurationMinutes.set(
            Number.isFinite(slotMin) && slotMin > 0 ? slotMin : 60
        );
    }

    /** Utility to build slots (inclusive of opening, exclusive of closing). */
    buildTimeSlots = computed(() => {
        const open = this.openingTime();
        const close = this.closingTime();
        const step = this.slotDurationMinutes();

        const [oh, om] = open.split(':').map(Number);
        const [ch, cm] = close.split(':').map(Number);

        const start = new Date(0, 0, 1, oh || 0, om || 0, 0, 0);
        const end = new Date(0, 0, 1, ch || 0, cm || 0, 0, 0);

        const out: string[] = [];
        for (
            let t = new Date(start);
            t < end;
            t = new Date(t.getTime() + step * 60_000)
        ) {
            const hh = String(t.getHours()).padStart(2, '0');
            const mm = String(t.getMinutes()).padStart(2, '0');
            out.push(`${hh}:${mm}`);
        }
        return out;
    });
}
