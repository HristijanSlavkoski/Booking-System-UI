import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '../../core/services/game.service';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfigService } from '../../core/services/config.service';
import { Game, GamePrice } from '../../models/game.model';
import { BookingRequest, PaymentMethod } from '../../models/booking.model';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { CalendarComponent } from '../../shared/components/calendar/calendar.component';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, LoadingComponent, CalendarComponent],
  template: `
    <div class="booking-page">
      <div class="booking-container">
        <h1 class="page-title">Book Your VR Experience</h1>

        @if (loading()) {
          <app-loading message="Loading..." [fullscreen]="true"></app-loading>
        } @else {
          <div class="booking-steps">
            <div class="steps-indicator">
              <div class="step" [class.active]="currentStep() >= 1" [class.completed]="currentStep() > 1">
                <div class="step-number">1</div>
                <div class="step-label">Select Game</div>
              </div>
              <div class="step-line" [class.completed]="currentStep() > 1"></div>
              <div class="step" [class.active]="currentStep() >= 2" [class.completed]="currentStep() > 2">
                <div class="step-number">2</div>
                <div class="step-label">Choose Date & Time</div>
              </div>
              <div class="step-line" [class.completed]="currentStep() > 2"></div>
              <div class="step" [class.active]="currentStep() >= 3" [class.completed]="currentStep() > 3">
                <div class="step-number">3</div>
                <div class="step-label">Players & Details</div>
              </div>
              <div class="step-line" [class.completed]="currentStep() > 3"></div>
              <div class="step" [class.active]="currentStep() >= 4">
                <div class="step-number">4</div>
                <div class="step-label">Payment</div>
              </div>
            </div>

            @if (currentStep() === 1) {
              <div class="step-content">
                <h2>Select Your Game</h2>
                <div class="games-selection">
                  @for (game of games(); track game.id) {
                    <div
                      class="game-select-card"
                      [class.selected]="selectedGameId === game.id"
                      (click)="selectGame(game.id)">
                      <img [src]="game.imageUrl" [alt]="game.name" class="game-image" />
                      <div class="game-info">
                        <h3>{{ game.name }}</h3>
                        <div class="game-meta">
                          <span>{{ game.duration }} min</span>
                          <span>{{ game.minPlayers }}-{{ game.maxPlayers }} players</span>
                          <span class="difficulty" [class]="game.difficulty.toLowerCase()">{{ game.difficulty }}</span>
                        </div>
                      </div>
                      @if (selectedGameId === game.id) {
                        <div class="selected-badge">✓ Selected</div>
                      }
                    </div>
                  }
                </div>
                <div class="step-actions">
                  <app-button variant="outline" (clicked)="cancel()">Cancel</app-button>
                  <app-button (clicked)="nextStep()" [disabled]="!selectedGameId">
                    Continue to Date & Time
                  </app-button>
                </div>
              </div>
            }

            @if (currentStep() === 2) {
              <div class="step-content">
                <h2>Select Available Date & Time</h2>
                <p class="step-description">Green slots are available. Click to select your preferred time.</p>
                <app-calendar
                  [gameId]="selectedGameId"
                  [maxConcurrentBookings]="maxConcurrentBookings()"
                  (slotSelected)="onSlotSelected($event)">
                </app-calendar>
                <div class="step-actions">
                  <app-button variant="outline" (clicked)="previousStep()">Back</app-button>
                </div>
              </div>
            }

            @if (currentStep() === 3) {
              <div class="step-content">
                <h2>Number of Players & Customer Information</h2>

                <div class="form-section">
                  <h3>How many players?</h3>
                  <div class="player-selection">
                    @for (num of playerOptions(); track num) {
                      <div
                        class="player-option"
                        [class.selected]="playerCount === num"
                        (click)="selectPlayers(num)">
                        <div class="player-count">{{ num }}</div>
                        <div class="player-label">{{ num === 1 ? 'Player' : 'Players' }}</div>
                        @if (getPriceForPlayers(num)) {
                          <div class="player-price">{{ getPriceForPlayers(num) }} MKD</div>
                        }
                      </div>
                    }
                  </div>
                  @if (totalPrice() > 0) {
                    <div class="price-summary">
                      <span class="price-label">Total Price:</span>
                      <span class="price-amount">{{ totalPrice() }} MKD</span>
                    </div>
                  }
                </div>

                <div class="form-section">
                  <h3>Your Information</h3>
                  <div class="form-grid">
                    <input type="text" [(ngModel)]="customerInfo.firstName" placeholder="First Name" class="text-input" required />
                    <input type="text" [(ngModel)]="customerInfo.lastName" placeholder="Last Name" class="text-input" required />
                    <input type="email" [(ngModel)]="customerInfo.email" placeholder="Email" class="text-input" required />
                    <input type="tel" [(ngModel)]="customerInfo.phone" placeholder="Phone" class="text-input" required />
                  </div>
                </div>

                <div class="step-actions">
                  <app-button variant="outline" (clicked)="previousStep()">Back</app-button>
                  <app-button (clicked)="nextStep()" [disabled]="!isStep3Valid()">
                    Continue to Payment
                  </app-button>
                </div>
              </div>
            }

            @if (currentStep() === 4) {
              <div class="step-content">
                <h2>Payment Method</h2>

                <div class="booking-summary">
                  <h3>Booking Summary</h3>
                  <div class="summary-item">
                    <span class="label">Game:</span>
                    <span class="value">{{ getSelectedGame()?.name }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Date:</span>
                    <span class="value">{{ formatDate(selectedDate) }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Time:</span>
                    <span class="value">{{ selectedTime }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Players:</span>
                    <span class="value">{{ playerCount }}</span>
                  </div>
                  <div class="summary-item total">
                    <span class="label">Total:</span>
                    <span class="value">{{ totalPrice() }} MKD</span>
                  </div>
                </div>

                <div class="form-section">
                  <h3>Choose Payment Method</h3>
                  <div class="payment-methods">
                    <label class="payment-method" [class.selected]="paymentMethod === 'ONLINE'">
                      <input type="radio" [(ngModel)]="paymentMethod" value="ONLINE" />
                      <div class="payment-content">
                        <div class="payment-icon">💳</div>
                        <div class="payment-info">
                          <div class="payment-title">Pay Online</div>
                          <div class="payment-desc">Secure payment via credit/debit card</div>
                        </div>
                      </div>
                    </label>
                    <label class="payment-method" [class.selected]="paymentMethod === 'CASH'">
                      <input type="radio" [(ngModel)]="paymentMethod" value="CASH" />
                      <div class="payment-content">
                        <div class="payment-icon">💵</div>
                        <div class="payment-info">
                          <div class="payment-title">Pay with Cash</div>
                          <div class="payment-desc">Pay when you arrive at the venue</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div class="step-actions">
                  <app-button variant="outline" (clicked)="previousStep()">Back</app-button>
                  <app-button (clicked)="submitBooking()" [disabled]="!paymentMethod" [loading]="submitting()">
                    {{ paymentMethod === 'ONLINE' ? 'Proceed to Payment' : 'Complete Booking' }}
                  </app-button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .booking-page {
      min-height: 100vh;
      background: #f9fafb;
      padding: 2rem;
    }

    .booking-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 800;
      color: #111827;
      text-align: center;
      margin: 0 0 2rem 0;
    }

    .steps-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 3rem;
      padding: 2rem;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .step-number {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      background: #e5e7eb;
      color: #9ca3af;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.25rem;
      transition: all 0.3s ease;
    }

    .step.active .step-number {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      transform: scale(1.1);
    }

    .step.completed .step-number {
      background: #10b981;
      color: white;
    }

    .step-label {
      font-size: 0.875rem;
      color: #6b7280;
      text-align: center;
      font-weight: 500;
    }

    .step.active .step-label {
      color: #667eea;
      font-weight: 600;
    }

    .step-line {
      width: 4rem;
      height: 2px;
      background: #e5e7eb;
      margin: 0 1rem;
      transition: all 0.3s ease;
    }

    .step-line.completed {
      background: #10b981;
    }

    .step-content {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .step-content h2 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #111827;
      margin: 0 0 1rem 0;
    }

    .step-description {
      color: #6b7280;
      margin-bottom: 2rem;
      font-size: 1rem;
    }

    .games-selection {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .game-select-card {
      border: 3px solid #e5e7eb;
      border-radius: 1rem;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    }

    .game-select-card:hover {
      border-color: #667eea;
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(102, 126, 234, 0.2);
    }

    .game-select-card.selected {
      border-color: #667eea;
      box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
    }

    .game-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }

    .game-info {
      padding: 1rem;
    }

    .game-info h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #111827;
      margin: 0 0 0.5rem 0;
    }

    .game-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
      color: #6b7280;
      flex-wrap: wrap;
    }

    .difficulty {
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
    }

    .difficulty.easy { background: #d1fae5; color: #065f46; }
    .difficulty.medium { background: #fef3c7; color: #92400e; }
    .difficulty.hard { background: #fee2e2; color: #991b1b; }

    .selected-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: #667eea;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .form-section {
      margin-bottom: 2rem;
    }

    .form-section h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #111827;
      margin: 0 0 1rem 0;
    }

    .player-selection {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .player-option {
      border: 3px solid #e5e7eb;
      border-radius: 0.75rem;
      padding: 1.5rem 1rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .player-option:hover {
      border-color: #667eea;
      transform: translateY(-2px);
    }

    .player-option.selected {
      border-color: #667eea;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .player-count {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    .player-label {
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .player-price {
      font-size: 0.875rem;
      font-weight: 600;
      margin-top: 0.5rem;
    }

    .player-option.selected .player-price {
      color: white;
    }

    .price-summary {
      background: #f0fdf4;
      border: 2px solid #86efac;
      border-radius: 0.75rem;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .price-label {
      font-size: 1.125rem;
      font-weight: 600;
      color: #166534;
    }

    .price-amount {
      font-size: 2rem;
      font-weight: 700;
      color: #166534;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .text-input {
      width: 100%;
      padding: 0.75rem;
      font-size: 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      transition: border-color 0.3s ease;
    }

    .text-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .booking-summary {
      background: #f9fafb;
      border-radius: 0.75rem;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .booking-summary h3 {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0 0 1rem 0;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .summary-item.total {
      border-bottom: none;
      padding-top: 1rem;
      margin-top: 0.5rem;
      border-top: 2px solid #111827;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .payment-methods {
      display: grid;
      gap: 1rem;
    }

    .payment-method {
      border: 3px solid #e5e7eb;
      border-radius: 0.75rem;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: block;
    }

    .payment-method:hover {
      border-color: #667eea;
    }

    .payment-method.selected {
      border-color: #667eea;
      background: #f5f7ff;
    }

    .payment-method input {
      display: none;
    }

    .payment-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .payment-icon {
      font-size: 2.5rem;
    }

    .payment-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: #111827;
      margin-bottom: 0.25rem;
    }

    .payment-desc {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .step-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e5e7eb;
    }

    @media (max-width: 768px) {
      .booking-container {
        padding: 0;
      }

      .page-title {
        font-size: 1.75rem;
      }

      .steps-indicator {
        flex-wrap: wrap;
        padding: 1rem;
      }

      .step-line {
        width: 2rem;
      }

      .step-label {
        font-size: 0.75rem;
      }

      .games-selection {
        grid-template-columns: 1fr;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .step-actions {
        flex-direction: column;
      }
    }
  `]
})
export class BookingComponent implements OnInit {
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
  selectedDate = '';
  selectedTime = '';
  playerCount: number = 0;
  paymentMethod: PaymentMethod = PaymentMethod.CASH;

  customerInfo = {
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  };

  pricing = signal<GamePrice[]>([]);
  totalPrice = signal(0);

  ngOnInit(): void {
    this.loadGames();
    this.loadUserInfo();
    this.loadConfig();

    const gameId = this.route.snapshot.queryParamMap.get('gameId');
    if (gameId) {
      this.selectedGameId = gameId;
      this.currentStep.set(2);
    }
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

  loadPricing(): void {
    this.gameService.getGamePricing(this.selectedGameId).subscribe({
      next: (pricing) => {
        this.pricing.set(pricing);
      },
      error: () => {
        this.notificationService.error('Failed to load pricing');
      }
    });
  }

  onSlotSelected(slot: { date: string; time: string }): void {
    this.selectedDate = slot.date;
    this.selectedTime = slot.time;
    this.nextStep();
  }

  selectPlayers(count: number): void {
    this.playerCount = count;
    this.calculatePrice();
  }

  calculatePrice(): void {
    if (!this.playerCount) {
      this.totalPrice.set(0);
      return;
    }

    const price = this.pricing().find(p => p.playerCount === this.playerCount);
    this.totalPrice.set(price?.price || 0);
  }

  getPriceForPlayers(count: number): number {
    const price = this.pricing().find(p => p.playerCount === count);
    return price?.price || 0;
  }

  playerOptions(): number[] {
    const game = this.games().find(g => g.id === this.selectedGameId);
    if (!game) return [];

    const options: number[] = [];
    for (let i = game.minPlayers; i <= game.maxPlayers; i++) {
      options.push(i);
    }
    return options;
  }

  getSelectedGame(): Game | undefined {
    return this.games().find(g => g.id === this.selectedGameId);
  }

  isStep3Valid(): boolean {
    return !!(
      this.playerCount &&
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
    const bookingRequest: BookingRequest = {
      gameId: this.selectedGameId,
      bookingDate: this.selectedDate,
      bookingTime: this.selectedTime,
      playerCount: this.playerCount,
      paymentMethod: this.paymentMethod,
      customerInfo: this.customerInfo,
      userId: this.authService.getCurrentUser()?.id
    };

    this.submitting.set(true);
    this.bookingService.createBooking(bookingRequest).subscribe({
      next: (response) => {
        this.notificationService.success('Booking created successfully!');
        if (response.paymentUrl) {
          window.location.href = response.paymentUrl;
        } else {
          this.router.navigate(['/']);
        }
        this.submitting.set(false);
      },
      error: () => {
        this.notificationService.error('Failed to create booking');
        this.submitting.set(false);
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  cancel(): void {
    this.router.navigate(['/games']);
  }
}
