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
import { BookingRequest, BookingGameRequest, PaymentMethod } from '../../models/booking.model';
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
          @if (currentStep() > 1) {
            <div class="selection-summary-bar">
              <div class="summary-item-bar">
                <span class="summary-icon">📅</span>
                <div class="summary-info">
                  <span class="summary-label">Date & Time</span>
                  <span class="summary-value">{{ formatDate(selectedDate) }} at {{ selectedTime }}</span>
                </div>
              </div>
              @if (currentStep() >= 2) {
                <div class="summary-item-bar">
                  <span class="summary-icon">🚪</span>
                  <div class="summary-info">
                    <span class="summary-label">Rooms</span>
                    <span class="summary-value">{{ selectedRooms }} {{ selectedRooms === 1 ? 'Room' : 'Rooms' }}</span>
                  </div>
                </div>
              }
              @if (currentStep() >= 3) {
                <div class="summary-item-bar">
                  <span class="summary-icon">🎮</span>
                  <div class="summary-info">
                    <span class="summary-label">Game(s)</span>
                    <span class="summary-value">{{ getSelectedGamesText() }}</span>
                  </div>
                </div>
              }
            </div>
          }
          <div class="booking-steps">
            <div class="steps-indicator">
              <div class="step" [class.active]="currentStep() >= 1" [class.completed]="currentStep() > 1">
                <div class="step-number">1</div>
                <div class="step-label">Choose Date & Time</div>
              </div>
              <div class="step-line" [class.completed]="currentStep() > 1"></div>
              <div class="step" [class.active]="currentStep() >= 2" [class.completed]="currentStep() > 2">
                <div class="step-number">2</div>
                <div class="step-label">Select Game</div>
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
                <h2>Select Available Date & Time</h2>
                <p class="step-description">Choose your preferred date and time. Green slots are available - click to select how many rooms you need.</p>
                <app-calendar
                  [maxConcurrentBookings]="maxConcurrentBookings()"
                  (slotSelected)="onSlotSelected($event)">
                </app-calendar>
                <div class="step-actions">
                  <app-button variant="outline" (clicked)="cancel()">Cancel</app-button>
                </div>
              </div>
            }

            @if (currentStep() === 2) {
              <div class="step-content">
                <h2>Select Your Game{{ selectedRooms > 1 ? 's' : '' }}</h2>
                @if (selectedRooms > 1) {
                  <p class="step-description">You're booking {{ selectedRooms }} rooms. Select a game for each room (can be the same game multiple times).</p>
                }
                @if (selectedRooms === 1) {
                  <div class="games-selection">
                    @for (game of games(); track game.id) {
                      <div
                        class="game-select-card"
                        [class.selected]="isGameSelected(game.id, 0)"
                        (click)="selectGameForRoom(game.id, 0)">
                        <img [src]="game.imageUrl" [alt]="game.name" class="game-image" />
                        <div class="game-info">
                          <h3>{{ game.name }}</h3>
                          <div class="game-meta">
                            <span>{{ game.duration }} min</span>
                            <span>{{ game.minPlayers }}-{{ game.maxPlayers }} players</span>
                            <span class="difficulty" [class]="game.difficulty.toLowerCase()">{{ game.difficulty }}</span>
                          </div>
                        </div>
                        @if (isGameSelected(game.id, 0)) {
                          <div class="selected-badge">✓ Selected</div>
                        }
                      </div>
                    }
                  </div>
                } @else {
                  <div class="multi-room-selection">
                    @for (roomIndex of getRoomIndexes(); track roomIndex) {
                      <div class="room-game-section">
                        <h3 class="room-title">Room {{ roomIndex + 1 }}</h3>
                        <div class="games-selection-compact">
                          @for (game of games(); track game.id) {
                            <div
                              class="game-select-card-compact"
                              [class.selected]="isGameSelected(game.id, roomIndex)"
                              (click)="selectGameForRoom(game.id, roomIndex)">
                              <img [src]="game.imageUrl" [alt]="game.name" class="game-image-small" />
                              <div class="game-info-compact">
                                <h4>{{ game.name }}</h4>
                                <div class="game-meta-small">
                                  <span class="difficulty" [class]="game.difficulty.toLowerCase()">{{ game.difficulty }}</span>
                                </div>
                              </div>
                              @if (isGameSelected(game.id, roomIndex)) {
                                <div class="selected-badge-small">✓</div>
                              }
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
                <div class="step-actions">
                  <app-button variant="outline" (clicked)="previousStep()">Back</app-button>
                  <app-button (clicked)="nextStep()" [disabled]="!allRoomsHaveGames()">
                    Continue to Players & Details
                  </app-button>
                </div>
              </div>
            }

            @if (currentStep() === 3) {
              <div class="step-content">
                <h2>Number of Players & Customer Information</h2>

                @if (selectedRooms === 1) {
                  <div class="form-section">
                    <h3>How many players?</h3>
                    <div class="player-selection">
                      @for (num of playerOptionsForRoom(0); track num) {
                        <div
                          class="player-option"
                          [class.selected]="getPlayersForRoom(0) === num"
                          (click)="selectPlayersForRoom(num, 0)">
                          <div class="player-count">{{ num }}</div>
                          <div class="player-label">{{ num === 1 ? 'Player' : 'Players' }}</div>
                          <div class="player-price">{{ getPriceForRoom(num, 0) || 0 }} MKD</div>
                        </div>
                      }
                    </div>
                  </div>
                } @else {
                  <div class="multi-room-players">
                    @for (roomIndex of getRoomIndexes(); track roomIndex) {
                      <div class="room-player-section">
                        <h3 class="room-title-small">Room {{ roomIndex + 1 }}: {{ getGameNameForRoom(roomIndex) }}</h3>
                        <div class="player-selection-compact">
                          @for (num of playerOptionsForRoom(roomIndex); track num) {
                            <div
                              class="player-option-compact"
                              [class.selected]="getPlayersForRoom(roomIndex) === num"
                              (click)="selectPlayersForRoom(num, roomIndex)">
                              <div class="player-count-compact">{{ num }}</div>
                              <div class="player-label-compact">{{ num === 1 ? 'Player' : 'Players' }}</div>
                              <div class="player-price-compact">{{ getPriceForRoom(num, roomIndex) || 0 }} MKD</div>
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }

                @if (getTotalPrice() > 0) {
                  <div class="price-summary">
                    <span class="price-label">Total Price (All Rooms):</span>
                    <span class="price-amount">{{ getTotalPrice() }} MKD</span>
                  </div>
                }

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
                    <span class="label">Date:</span>
                    <span class="value">{{ formatDate(selectedDate) }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Time:</span>
                    <span class="value">{{ selectedTime }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Rooms:</span>
                    <span class="value">{{ selectedRooms }}</span>
                  </div>
                  @for (game of selectedGames(); track game.gameId; let i = $index) {
                    <div class="summary-item">
                      <span class="label">Room {{ i + 1 }}:</span>
                      <span class="value">{{ getGameName(game.gameId) }} - {{ game.playerCount }} players</span>
                    </div>
                  }
                  <div class="summary-item">
                    <span class="label">Total Players:</span>
                    <span class="value">{{ getTotalPlayers() }}</span>
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
      background: #0a0a0a;
      padding: 2rem;
    }

    .booking-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 800;
      color: #ffffff;
      text-align: center;
      margin: 0 0 2rem 0;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .selection-summary-bar {
      display: flex;
      gap: 1.5rem;
      background: #1a1a1a;
      padding: 1.5rem;
      border-radius: 1rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      flex-wrap: wrap;
      border: 1px solid #2a2a2a;
    }

    .summary-item-bar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.25rem;
      background: #0a0a0a;
      border-radius: 0.5rem;
      border: 2px solid #2a2a2a;
    }

    .summary-icon {
      font-size: 1.5rem;
    }

    .summary-info {
      display: flex;
      flex-direction: column;
    }

    .summary-label {
      font-size: 0.75rem;
      color: #888;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .summary-value {
      font-size: 1rem;
      color: #ffffff;
      font-weight: 600;
    }

    .steps-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 3rem;
      padding: 2rem;
      background: #1a1a1a;
      border-radius: 1rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      border: 1px solid #2a2a2a;
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
      background: #2a2a2a;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.25rem;
      transition: all 0.3s ease;
    }

    .step.active .step-number {
      background: #FF0040;
      color: white;
      transform: scale(1.1);
      box-shadow: 0 0 20px rgba(255, 0, 64, 0.5);
    }

    .step.completed .step-number {
      background: #FF0040;
      color: white;
    }

    .step-label {
      font-size: 0.875rem;
      color: #888;
      text-align: center;
      font-weight: 500;
    }

    .step.active .step-label {
      color: #FF0040;
      font-weight: 600;
    }

    .step-line {
      width: 4rem;
      height: 2px;
      background: #2a2a2a;
      margin: 0 1rem;
      transition: all 0.3s ease;
    }

    .step-line.completed {
      background: #FF0040;
    }

    .step-content {
      background: #1a1a1a;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      border: 1px solid #2a2a2a;
    }

    .step-content h2 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 1rem 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .step-description {
      color: #aaa;
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
      border: 3px solid #2a2a2a;
      border-radius: 1rem;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      background: #0a0a0a;
    }

    .game-select-card:hover {
      border-color: #FF0040;
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(255, 0, 64, 0.4);
    }

    .game-select-card.selected {
      border-color: #FF0040;
      box-shadow: 0 8px 16px rgba(255, 0, 64, 0.6);
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
      color: #ffffff;
      margin: 0 0 0.5rem 0;
    }

    .game-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
      color: #aaa;
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
      background: #FF0040;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-weight: 600;
      font-size: 0.875rem;
      box-shadow: 0 0 15px rgba(255, 0, 64, 0.6);
    }

    .multi-room-selection {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .room-game-section {
      border: 2px solid #2a2a2a;
      border-radius: 1rem;
      padding: 1.5rem;
      background: #0a0a0a;
    }

    .room-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
      margin: 0 0 1rem 0;
      padding: 0.5rem 1rem;
      background: #FF0040;
      border-radius: 0.5rem;
      display: inline-block;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .games-selection-compact {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }

    .game-select-card-compact {
      border: 3px solid #2a2a2a;
      border-radius: 0.75rem;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      background: #1a1a1a;
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
    }

    .game-select-card-compact:hover {
      border-color: #FF0040;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(255, 0, 64, 0.4);
    }

    .game-select-card-compact.selected {
      border-color: #FF0040;
      background: #2a0a0a;
      box-shadow: 0 4px 8px rgba(255, 0, 64, 0.5);
    }

    .game-image-small {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 0.5rem;
      flex-shrink: 0;
    }

    .game-info-compact {
      flex: 1;
    }

    .game-info-compact h4 {
      font-size: 1rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.5rem 0;
    }

    .game-meta-small {
      display: flex;
      gap: 0.5rem;
      font-size: 0.75rem;
    }

    .selected-badge-small {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: #FF0040;
      color: white;
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.25rem;
    }

    .multi-room-players {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .room-player-section {
      border: 2px solid #2a2a2a;
      border-radius: 1rem;
      padding: 1.5rem;
      background: #0a0a0a;
    }

    .room-title-small {
      font-size: 1.125rem;
      font-weight: 700;
      color: white;
      margin: 0 0 1rem 0;
      padding: 0.5rem 1rem;
      background: #FF0040;
      border-radius: 0.5rem;
      display: inline-block;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .player-selection-compact {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 1rem;
    }

    .player-option-compact {
      border: 3px solid #2a2a2a;
      border-radius: 0.75rem;
      padding: 1rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #1a1a1a;
      color: #fff;
    }

    .player-option-compact:hover {
      border-color: #FF0040;
      transform: translateY(-2px);
      box-shadow: 0 0 15px rgba(255, 0, 64, 0.3);
    }

    .player-option-compact.selected {
      border-color: #FF0040;
      background: #FF0040;
      color: white;
      box-shadow: 0 0 20px rgba(255, 0, 64, 0.6);
    }

    .player-count-compact {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    .player-label-compact {
      font-size: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .player-price-compact {
      font-size: 0.75rem;
      font-weight: 600;
      margin-top: 0.5rem;
    }

    .player-option-compact.selected .player-price-compact {
      color: white;
    }

    .form-section {
      margin-bottom: 2rem;
    }

    .form-section h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 1rem 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .player-selection {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .player-option {
      border: 3px solid #2a2a2a;
      border-radius: 0.75rem;
      padding: 1.5rem 1rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #1a1a1a;
      color: #fff;
    }

    .player-option:hover {
      border-color: #FF0040;
      transform: translateY(-2px);
      box-shadow: 0 0 15px rgba(255, 0, 64, 0.3);
    }

    .player-option.selected {
      border-color: #FF0040;
      background: #FF0040;
      color: white;
      box-shadow: 0 0 20px rgba(255, 0, 64, 0.6);
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
      background: #1a1a1a;
      border: 2px solid #FF0040;
      border-radius: 0.75rem;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 0 20px rgba(255, 0, 64, 0.3);
    }

    .price-label {
      font-size: 1.125rem;
      font-weight: 600;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .price-amount {
      font-size: 2rem;
      font-weight: 700;
      color: #FF0040;
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
      border: 2px solid #2a2a2a;
      border-radius: 0.5rem;
      transition: border-color 0.3s ease;
      background: #0a0a0a;
      color: #fff;
    }

    .text-input:focus {
      outline: none;
      border-color: #FF0040;
      box-shadow: 0 0 10px rgba(255, 0, 64, 0.3);
    }

    .text-input::placeholder {
      color: #666;
    }

    .booking-summary {
      background: #1a1a1a;
      border-radius: 0.75rem;
      padding: 1.5rem;
      margin-bottom: 2rem;
      border: 1px solid #2a2a2a;
    }

    .booking-summary h3 {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0 0 1rem 0;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid #2a2a2a;
      color: #aaa;
    }

    .summary-item .value {
      color: #fff;
      font-weight: 600;
    }

    .summary-item.total {
      border-bottom: none;
      padding-top: 1rem;
      margin-top: 0.5rem;
      border-top: 2px solid #FF0040;
      font-size: 1.25rem;
      font-weight: 700;
      color: #fff;
    }

    .summary-item.total .value {
      color: #FF0040;
    }

    .payment-methods {
      display: grid;
      gap: 1rem;
    }

    .payment-method {
      border: 3px solid #2a2a2a;
      border-radius: 0.75rem;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: block;
      background: #1a1a1a;
    }

    .payment-method:hover {
      border-color: #FF0040;
      box-shadow: 0 0 15px rgba(255, 0, 64, 0.3);
    }

    .payment-method.selected {
      border-color: #FF0040;
      background: #2a0a0a;
      box-shadow: 0 0 20px rgba(255, 0, 64, 0.4);
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
      color: #ffffff;
      margin-bottom: 0.25rem;
    }

    .payment-desc {
      font-size: 0.875rem;
      color: #aaa;
    }

    .step-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #2a2a2a;
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
  selectedGames = signal<{gameId: string; playerCount: number}[]>([]);
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

  pricing = signal<GamePrice[]>([]);
  totalPrice = signal(0);

  ngOnInit(): void {
    this.loadGames();
    this.loadUserInfo();
    this.loadConfig();

    const gameId = this.route.snapshot.queryParamMap.get('gameId');
    const players = this.route.snapshot.queryParamMap.get('players');

    if (gameId) {
      this.selectedGameId = gameId;
      this.loadPricing();
      this.selectedGames.set([{gameId: gameId, playerCount: 0}]);
      this.currentStep.set(1);
    }

    if (players) {
      const playerCount = parseInt(players, 10);
      if (!isNaN(playerCount)) {
        this.playerCount = playerCount;
      }
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

  selectGameForRoom(gameId: string, roomIndex: number): void {
    const currentGames = this.selectedGames();
    const updated = [...currentGames];

    if (updated[roomIndex]) {
      updated[roomIndex] = { gameId, playerCount: updated[roomIndex].playerCount };
    } else {
      updated[roomIndex] = { gameId, playerCount: 0 };
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
    return Array.from({ length: this.selectedRooms }, (_, i) => i);
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

    const games = [];
    for (let i = 0; i < slot.rooms; i++) {
      if (this.selectedGameId) {
        games.push({ gameId: this.selectedGameId, playerCount: 0 });
      } else {
        games.push({ gameId: '', playerCount: 0 });
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
        const gameObj = this.games().find(g => g.id === game.gameId);
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
    const game = this.games().find(g => g.id === gameId);
    if (!game) return 0;

    return (playerCount * 1000) + (playerCount - 1) * 300;
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

  playerOptionsForRoom(roomIndex: number): number[] {
    const gameData = this.selectedGames()[roomIndex];
    if (!gameData?.gameId) return [];

    const game = this.games().find(g => g.id === gameData.gameId);
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

    const gameObj = this.games().find(g => g.id === game.gameId);
    return gameObj?.name || 'Unknown game';
  }

  getSelectedGamesText(): string {
    const games = this.selectedGames();
    const gameNames = games
      .filter(g => g.gameId)
      .map((g, i) => {
        const gameObj = this.games().find(game => game.id === g.gameId);
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
    return this.games().find(g => g.id === this.selectedGameId);
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
      const game = this.games().find(game => game.id === g.gameId);
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
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  getGameName(gameId: string): string {
    return this.games().find(g => g.id === gameId)?.name || 'Unknown Game';
  }

  getTotalPlayers(): number {
    return this.selectedGames().reduce((total, game) => total + game.playerCount, 0);
  }

  cancel(): void {
    this.router.navigate(['/games']);
  }
}
