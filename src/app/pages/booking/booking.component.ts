import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '../../core/services/game.service';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Game, GamePrice } from '../../models/game.model';
import { BookingRequest, PaymentMethod } from '../../models/booking.model';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, LoadingComponent],
  template: `
    <div class="booking-page">
      <div class="booking-container">
        <h1 class="page-title">Book Your VR Experience</h1>

        @if (loading()) {
          <app-loading message="Loading..." [fullscreen]="true"></app-loading>
        } @else {
          <div class="booking-steps">
            <div class="booking-form">
              <div class="form-section">
                <h2>Select Game</h2>
                <select [(ngModel)]="selectedGameId" (ngModelChange)="onGameChange()" class="select-input">
                  <option value="">-- Choose a game --</option>
                  @for (game of games(); track game.id) {
                    <option [value]="game.id">{{ game.name }}</option>
                  }
                </select>
              </div>

              @if (selectedGameId) {
                <div class="form-section">
                  <h2>Select Date & Time</h2>
                  <input type="date" [(ngModel)]="selectedDate" (ngModelChange)="onDateChange()" class="select-input" [min]="minDate" />
                  @if (selectedDate) {
                    <select [(ngModel)]="selectedTime" class="select-input">
                      <option value="">-- Choose a time slot --</option>
                      @for (slot of timeSlots(); track slot) {
                        <option [value]="slot">{{ slot }}</option>
                      }
                    </select>
                  }
                </div>

                <div class="form-section">
                  <h2>Number of Players</h2>
                  <select [(ngModel)]="playerCount" (ngModelChange)="calculatePrice()" class="select-input">
                    <option value="">-- Select players --</option>
                    @for (num of playerOptions(); track num) {
                      <option [value]="num">{{ num }} {{ num === 1 ? 'Player' : 'Players' }}</option>
                    }
                  </select>
                  @if (totalPrice() > 0) {
                    <div class="price-display">
                      <span class="price-label">Total Price:</span>
                      <span class="price-amount">{{ totalPrice() }} MKD</span>
                    </div>
                  }
                </div>

                <div class="form-section">
                  <h2>Customer Information</h2>
                  <div class="form-grid">
                    <input type="text" [(ngModel)]="customerInfo.firstName" placeholder="First Name" class="text-input" />
                    <input type="text" [(ngModel)]="customerInfo.lastName" placeholder="Last Name" class="text-input" />
                    <input type="email" [(ngModel)]="customerInfo.email" placeholder="Email" class="text-input" />
                    <input type="tel" [(ngModel)]="customerInfo.phone" placeholder="Phone" class="text-input" />
                  </div>
                </div>

                <div class="form-section">
                  <h2>Payment Method</h2>
                  <div class="payment-options">
                    <label class="payment-option">
                      <input type="radio" [(ngModel)]="paymentMethod" value="ONLINE" />
                      <span>Pay Online</span>
                    </label>
                    <label class="payment-option">
                      <input type="radio" [(ngModel)]="paymentMethod" value="CASH" />
                      <span>Pay with Cash on Arrival</span>
                    </label>
                  </div>
                </div>

                <div class="form-actions">
                  <app-button variant="outline" (clicked)="cancel()">Cancel</app-button>
                  <app-button (clicked)="submitBooking()" [disabled]="!isFormValid()" [loading]="submitting()">
                    {{ paymentMethod === 'ONLINE' ? 'Proceed to Payment' : 'Complete Booking' }}
                  </app-button>
                </div>
              }
            </div>
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
      max-width: 800px;
      margin: 0 auto;
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 800;
      color: #111827;
      text-align: center;
      margin: 0 0 2rem 0;
    }

    .booking-form {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .form-section {
      margin-bottom: 2rem;
    }

    .form-section h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #111827;
      margin: 0 0 1rem 0;
    }

    .select-input,
    .text-input {
      width: 100%;
      padding: 0.75rem;
      font-size: 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      transition: border-color 0.3s ease;
    }

    .select-input:focus,
    .text-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .price-display {
      margin-top: 1rem;
      padding: 1rem;
      background: #f0fdf4;
      border: 2px solid #86efac;
      border-radius: 0.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .price-label {
      font-size: 1rem;
      font-weight: 600;
      color: #166534;
    }

    .price-amount {
      font-size: 1.5rem;
      font-weight: 700;
      color: #166534;
    }

    .payment-options {
      display: flex;
      gap: 1rem;
    }

    .payment-option {
      flex: 1;
      padding: 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .payment-option:has(input:checked) {
      border-color: #667eea;
      background: #f5f7ff;
    }

    .payment-option input[type="radio"] {
      width: 1.25rem;
      height: 1.25rem;
      cursor: pointer;
    }

    .payment-option span {
      font-weight: 500;
      color: #374151;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    @media (max-width: 768px) {
      .page-title {
        font-size: 1.75rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .payment-options {
        flex-direction: column;
      }

      .form-actions {
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
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  games = signal<Game[]>([]);
  loading = signal(false);
  submitting = signal(false);

  selectedGameId = '';
  selectedDate = '';
  selectedTime = '';
  playerCount: number | string = '';
  paymentMethod: PaymentMethod = PaymentMethod.CASH;

  customerInfo = {
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  };

  pricing = signal<GamePrice[]>([]);
  timeSlots = signal<string[]>([]);
  totalPrice = signal(0);

  minDate = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    this.loadGames();
    this.loadUserInfo();

    const gameId = this.route.snapshot.queryParamMap.get('gameId');
    if (gameId) {
      this.selectedGameId = gameId;
      this.onGameChange();
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

  onGameChange(): void {
    if (this.selectedGameId) {
      this.loadPricing();
      this.generateTimeSlots();
    }
  }

  onDateChange(): void {
    this.generateTimeSlots();
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

  generateTimeSlots(): void {
    const slots: string[] = [];
    for (let hour = 9; hour <= 21; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    this.timeSlots.set(slots);
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

  calculatePrice(): void {
    if (!this.playerCount) {
      this.totalPrice.set(0);
      return;
    }

    const price = this.pricing().find(p => p.playerCount === Number(this.playerCount));
    this.totalPrice.set(price?.price || 0);
  }

  isFormValid(): boolean {
    return !!(
      this.selectedGameId &&
      this.selectedDate &&
      this.selectedTime &&
      this.playerCount &&
      this.customerInfo.firstName &&
      this.customerInfo.lastName &&
      this.customerInfo.email &&
      this.customerInfo.phone &&
      this.paymentMethod
    );
  }

  submitBooking(): void {
    if (!this.isFormValid()) return;

    const bookingRequest: BookingRequest = {
      gameId: this.selectedGameId,
      bookingDate: this.selectedDate,
      bookingTime: this.selectedTime,
      playerCount: Number(this.playerCount),
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
          this.router.navigate(['/booking/confirmation'], {
            queryParams: { bookingId: response.booking.id }
          });
        }
        this.submitting.set(false);
      },
      error: () => {
        this.notificationService.error('Failed to create booking');
        this.submitting.set(false);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/games']);
  }
}
