import {Component, inject, Input, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {GameService} from '../../core/services/game.service';
import {BookingService} from '../../core/services/booking.service';
import {AuthService} from '../../core/services/auth.service';
import {NotificationService} from '../../core/services/notification.service';
import {ConfigService} from '../../core/services/config.service';
import {Game, GamePrice} from '../../models/game.model';
import {BookingRequest, PaymentMethod} from '../../models/booking.model';
import {ButtonComponent} from '../../shared/components/button/button.component';
import {LoadingComponent} from '../../shared/components/loading/loading.component';
import {CalendarComponent} from '../../shared/components/calendar/calendar.component';
import {Tier} from "../../models/config.model";

@Component({
    selector: 'app-booking',
    standalone: true,
    imports: [CommonModule, FormsModule, LoadingComponent, CalendarComponent, ButtonComponent],
    templateUrl: './booking.component.html',
    styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
    @Input() embedded = false;

    private gameService = inject(GameService);
    private bookingService = inject(BookingService);
    private authService = inject(AuthService);
    private notificationService = inject(NotificationService);
    private configService = inject(ConfigService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    games = signal<Game[]>([]);
    loading = signal(false);
    submitting = signal(false);
    currentStep = signal(1);
    maxConcurrentBookings = signal(2);

    selectedGameId = '';
    selectedGames = signal<{ gameId: string; playerCount: number }[]>([]);
    selectedDate = '';
    selectedTime = '';
    selectedRooms: number = 0;
    playerCount: number = 0;
    paymentMethod: PaymentMethod = PaymentMethod.CASH;

    customerInfo = {
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    };

    // PRICING (same model as PlayersComponent)
    tiers = signal<Tier[]>([]);
    weekendMultiplier = signal<number>(1.0);
    holidayMultiplier = signal<number>(1.0);
    holidays = signal<string[]>([]); // ISO 'YYYY-MM-DD'
    taxPercentage = signal<number>(0);

    pricing = signal<GamePrice[]>([]);
    totalPrice = signal(0);

    ngOnInit(): void {
        this.loadGames();
        this.loadUserInfo();
        this.loadConfig();

        const qp = this.route.snapshot.queryParamMap;
        const gameId = qp.get('gameId') || '';
        const players = qp.get('players');
        const date = qp.get('date') || '';
        const time = qp.get('time') || '';
        const rooms = qp.get('rooms');

        if (date) this.selectedDate = date;
        if (time) this.selectedTime = time;
        if (rooms) this.selectedRooms = parseInt(rooms, 10) || 1;
        else this.selectedRooms = 1;

        if (gameId) {
            this.selectedGameId = gameId;
            // seed selectedGames for 1 room by default
            this.selectedGames.set([{gameId, playerCount: 0}]);
        }

        if (players) {
            const p = parseInt(players, 10);
            if (!isNaN(p)) {
                this.playerCount = p;
                // also store into room 0 if present
                const arr = this.selectedGames();
                if (arr.length === 0 && gameId) {
                    this.selectedGames.set([{gameId, playerCount: p}]);
                } else if (arr[0]) {
                    arr[0] = {gameId: arr[0].gameId || gameId, playerCount: p};
                    this.selectedGames.set([...arr]);
                }
            }
        }

        this.loadPricing();

        // Decide current step:
        // In embedded mode we already have date/time/gameId/players, so jump to Players & Details (3)
        if (this.embedded) {
            this.currentStep.set(3);
            this.updateTotalPrice();
            return;
        }

        // Original logic for full-page flow:
        if (this.selectedDate && this.selectedTime && this.selectedGameId && this.playerCount > 0) {
            this.currentStep.set(3);
        } else if (this.selectedDate && this.selectedTime && this.selectedRooms) {
            this.currentStep.set(gameId ? 3 : 2);
        } else if (gameId) {
            this.currentStep.set(1);
        }
    }

    // Optional: when embedded, lock player selection (hide or disable)
    isEmbeddedPlayersLocked(): boolean {
        return this.embedded && !!this.playerCount;
    }

    loadGames(): void {
        this.loading.set(true);
        this.gameService.getActiveGames().subscribe({
            next: (games) => {
                this.games.set(games);
                this.loading.set(false);
            },
            error: () => {
                this.notificationService.error('Failed to load games');
                this.loading.set(false);
            }
        });
    }

    loadUserInfo(): void {
        const user = this.authService.getCurrentUser();
        if (user) {
            this.customerInfo.firstName = user.firstName;
            this.customerInfo.lastName = user.lastName;
            this.customerInfo.email = user.email;
            this.customerInfo.phone = user.phone;
        }
    }

    loadConfig(): void {
        this.configService.loadConfig().subscribe({
            next: (config) => {
                this.maxConcurrentBookings.set(config.maxConcurrentBookings);
            }
        });
    }

    selectGame(gameId: string): void {
        this.selectedGameId = gameId;
        this.loadPricing();
    }

    selectGameForRoom(gameId: string, roomIndex: number): void {
        const currentGames = this.selectedGames();
        const updated = [...currentGames];

        if (updated[roomIndex]) {
            updated[roomIndex] = {gameId, playerCount: updated[roomIndex].playerCount};
        } else {
            updated[roomIndex] = {gameId, playerCount: 0};
        }

        this.selectedGames.set(updated);
        this.selectedGameId = gameId;
        this.loadPricing();
        this.updateTotalPrice();
    }

    isGameSelected(gameId: string, roomIndex: number): boolean {
        const games = this.selectedGames();
        return games[roomIndex]?.gameId === gameId;
    }

    getRoomIndexes(): number[] {
        return Array.from({length: this.selectedRooms}, (_, i) => i);
    }

    allRoomsHaveGames(): boolean {
        const games = this.selectedGames();
        for (let i = 0; i < this.selectedRooms; i++) {
            if (!games[i]?.gameId) {
                return false;
            }
        }
        return true;
    }

    loadPricing(): void {
        this.configService.config$.subscribe({
            next: (config) => {
                if (config?.pricingConfig) {
                    const pricingConfig = config.pricingConfig;
                    // TODO: transform pricingConfig into this.pricing if needed
                    this.pricing.set([]);
                }
            },
            error: () => {
                this.notificationService.error('Failed to load pricing');
            }
        });
    }

    onSlotSelected(slot: { date: string; time: string; rooms: number }): void {
        this.selectedDate = slot.date;
        this.selectedTime = slot.time;
        this.selectedRooms = slot.rooms;

        const games: { gameId: string; playerCount: number }[] = [];
        for (let i = 0; i < slot.rooms; i++) {
            if (this.selectedGameId) {
                games.push({gameId: this.selectedGameId, playerCount: 0});
            } else {
                games.push({gameId: '', playerCount: 0});
            }
        }
        this.selectedGames.set(games);

        if (this.selectedGameId) {
            this.currentStep.set(3);
        } else {
            this.nextStep();
        }
    }

    selectPlayers(count: number): void {
        this.playerCount = count;
        this.calculatePrice();
    }

    selectPlayersForRoom(count: number, roomIndex: number): void {
        const games = this.selectedGames();
        const updated = [...games];
        if (updated[roomIndex]) {
            updated[roomIndex].playerCount = count;
        }
        this.selectedGames.set(updated);
        this.updateTotalPrice();
    }

    getPlayersForRoom(roomIndex: number): number {
        return this.selectedGames()[roomIndex]?.playerCount || 0;
    }

    calculatePrice(): void {
        if (!this.playerCount) {
            this.totalPrice.set(0);
            return;
        }

        const price = this.pricing().find(p => p.playerCount === this.playerCount);
        this.totalPrice.set(price?.price || 0);
    }

    getTotalPrice(): number {
        let total = 0;
        const games = this.selectedGames();

        for (const game of games) {
            if (game.gameId && game.playerCount > 0) {
                const gameObj = this.games().find(g => g.code === game.gameId);
                if (gameObj) {
                    const price = this.getPriceForGame(game.gameId, game.playerCount);
                    total += price;
                }
            }
        }

        return total;
    }

    updateTotalPrice(): void {
        const total = this.getTotalPrice();
        this.totalPrice.set(total);
    }

    getPriceForPlayers(count: number): number {
        const price = this.pricing().find(p => p.playerCount === count);
        return price?.price || 0;
    }

    getPriceForRoom(count: number, roomIndex: number): number {
        const game = this.selectedGames()[roomIndex];
        if (!game?.gameId) return 0;
        return this.getPriceForGame(game.gameId, count);
    }

    getPriceForGame(gameId: string, playerCount: number): number {
        const game = this.games().find(g => g.code === gameId);
        if (!game) return 0;

        // Placeholder pricing logic
        return playerCount * 1000 + (playerCount - 1) * 300;
    }

    playerOptions(): number[] {
        const game = this.games().find(g => g.code === this.selectedGameId);
        if (!game) return [];

        const options: number[] = [];
        for (let i = game.minPlayers; i <= game.maxPlayers; i++) {
            options.push(i);
        }
        return options;
    }

    playerOptionsForRoom(roomIndex: number): number[] {
        const gameData = this.selectedGames()[roomIndex];
        if (!gameData?.gameId) return [];

        const game = this.games().find(g => g.code === gameData.gameId);
        if (!game) return [];

        const options: number[] = [];
        for (let i = game.minPlayers; i <= game.maxPlayers; i++) {
            options.push(i);
        }
        return options;
    }

    getGameNameForRoom(roomIndex: number): string {
        const game = this.selectedGames()[roomIndex];
        if (!game?.gameId) return 'No game selected';

        const gameObj = this.games().find(g => g.code === game.gameId);
        return gameObj?.name || 'Unknown game';
    }

    getSelectedGamesText(): string {
        const games = this.selectedGames();
        const gameNames = games
            .filter(g => g.gameId)
            .map((g) => {
                const gameObj = this.games().find(game => game.code === g.gameId);
                return gameObj?.name || 'Unknown';
            });

        if (gameNames.length === 0) return 'None selected';
        if (gameNames.length === 1) return gameNames[0];

        const uniqueGames = [...new Set(gameNames)];
        if (uniqueGames.length === 1) {
            return `${uniqueGames[0]} (${gameNames.length}x)`;
        }

        return gameNames.join(', ');
    }

    getSelectedGame(): Game | undefined {
        return this.games().find(g => g.code === this.selectedGameId);
    }

    isStep3Valid(): boolean {
        const games = this.selectedGames();
        const allRoomsHavePlayers = games.every(g => g.playerCount > 0);

        return !!(
            allRoomsHavePlayers &&
            this.customerInfo.firstName &&
            this.customerInfo.lastName &&
            this.customerInfo.email &&
            this.customerInfo.phone
        );
    }

    nextStep(): void {
        this.currentStep.update(step => step + 1);
        window.scrollTo(0, 0);
    }

    previousStep(): void {
        this.currentStep.update(step => step - 1);
        window.scrollTo(0, 0);
    }

    submitBooking(): void {
        const games = this.selectedGames().map((g, index) => {
            const pricing = this.pricing().find(p => p.gameId === g.gameId && p.playerCount === g.playerCount);
            const price = pricing?.price || 0;

            return {
                gameId: g.gameId,
                roomNumber: index + 1,
                playerCount: g.playerCount,
                price: price
            };
        });

        const bookingRequest: BookingRequest = {
            bookingDate: this.selectedDate,
            bookingTime: this.selectedTime,
            numberOfRooms: this.selectedRooms,
            totalPrice: this.totalPrice(),
            paymentMethod: this.paymentMethod,
            customerFirstName: this.customerInfo.firstName,
            customerLastName: this.customerInfo.lastName,
            customerEmail: this.customerInfo.email,
            customerPhone: this.customerInfo.phone,
            games: games
        };

        console.log('Submitting booking:', bookingRequest);

        this.submitting.set(true);
        this.bookingService.createBooking(bookingRequest).subscribe({
            next: (response) => {
                this.notificationService.success('Booking created successfully!');
                if (response.paymentUrl) {
                    window.location.href = response.paymentUrl;
                } else {
                    this.router.navigate(['/my-bookings']);
                }
                this.submitting.set(false);
            },
            error: (err) => {
                console.error('Booking error:', err);
                this.notificationService.error('Failed to create booking: ' + (err.error?.error || 'Unknown error'));
                this.submitting.set(false);
            }
        });
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'});
    }

    getGameName(gameId: string): string {
        return this.games().find(g => g.code === gameId)?.name || 'Unknown Game';
    }

    getTotalPlayers(): number {
        return this.selectedGames().reduce((total, game) => total + game.playerCount, 0);
    }

    cancel(): void {
        this.router.navigate(['/games']);
    }

    onGamePickRequested(e: { date: string; time: string }) {
        // user clicked a slot but no game is preselected
        this.selectedDate = e.date;
        this.selectedTime = e.time;
        this.selectedRooms = 1;

        // prepare one room with empty game, to be set in Step 2
        this.selectedGames.set([{gameId: '', playerCount: 0}]);

        // reflect in URL but keep current route
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {date: e.date, time: e.time},
            queryParamsHandling: 'merge',
        });

        // move to "Select Game"
        this.currentStep.set(2);
        window.scrollTo(0, 0);
    }
}
