import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from '../../../core/services/game.service';
import { Game, GamePrice } from '../../../models/game.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, ButtonComponent, LoadingComponent],
  template: `
    <div class="game-detail-page">
      @if (loading()) {
        <app-loading message="Loading game details..." [fullscreen]="true"></app-loading>
      } @else if (game()) {
        <div class="game-detail-container">
          <div class="game-header">
            <div class="game-image-large">
              <img [src]="game()!.imageUrl" [alt]="game()!.name" />
            </div>
            <div class="game-info">
              <h1 class="game-title">{{ game()!.name }}</h1>
              <span class="game-difficulty" [class]="game()!.difficulty.toLowerCase()">
                {{ game()!.difficulty }}
              </span>
              <p class="game-description">{{ game()!.description }}</p>
              <div class="game-stats">
                <div class="stat-item">
                  <span class="stat-label">Duration</span>
                  <span class="stat-value">{{ game()!.duration }} min</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Players</span>
                  <span class="stat-value">{{ game()!.minPlayers }}-{{ game()!.maxPlayers }}</span>
                </div>
              </div>
              <app-button size="large" [fullWidth]="true" (clicked)="bookGame()">
                Book This Experience
              </app-button>
            </div>
          </div>

          @if (pricing().length > 0) {
            <div class="pricing-section">
              <h2>Pricing</h2>
              <div class="pricing-grid">
                @for (price of pricing(); track price.playerCount) {
                  <div class="price-card">
                    <div class="player-count">{{ price.playerCount }} {{ price.playerCount === 1 ? 'Player' : 'Players' }}</div>
                    <div class="price-amount">{{ price.price }} {{ price.currency }}</div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="error-state">
          <p>Game not found</p>
          <app-button (clicked)="goBack()">Go Back</app-button>
        </div>
      }
    </div>
  `,
  styles: [`
    .game-detail-page {
      min-height: 100vh;
      background: #f9fafb;
      padding: 2rem;
    }

    .game-detail-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .game-header {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .game-image-large {
      width: 100%;
      height: 400px;
      border-radius: 0.5rem;
      overflow: hidden;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .game-image-large img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .game-info {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .game-title {
      font-size: 2.5rem;
      font-weight: 800;
      color: #111827;
      margin: 0;
    }

    .game-difficulty {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      width: fit-content;
    }

    .game-difficulty.easy {
      background: #d1fae5;
      color: #065f46;
    }

    .game-difficulty.medium {
      background: #fef3c7;
      color: #92400e;
    }

    .game-difficulty.hard {
      background: #fee2e2;
      color: #991b1b;
    }

    .game-difficulty.expert {
      background: #e0e7ff;
      color: #3730a3;
    }

    .game-description {
      color: #374151;
      line-height: 1.8;
      font-size: 1.125rem;
      margin: 0;
    }

    .game-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 0.5rem;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
      font-weight: 500;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
    }

    .pricing-section {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .pricing-section h2 {
      font-size: 2rem;
      font-weight: 700;
      color: #111827;
      margin: 0 0 1.5rem 0;
    }

    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
    }

    .price-card {
      background: #f9fafb;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1.5rem;
      text-align: center;
      transition: all 0.3s ease;
    }

    .price-card:hover {
      border-color: #667eea;
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }

    .player-count {
      font-size: 0.875rem;
      color: #6b7280;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .price-amount {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
    }

    .error-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .error-state p {
      font-size: 1.25rem;
      color: #6b7280;
      margin-bottom: 2rem;
    }

    @media (max-width: 768px) {
      .game-header {
        grid-template-columns: 1fr;
      }

      .game-image-large {
        height: 300px;
      }

      .game-title {
        font-size: 1.75rem;
      }

      .pricing-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      }
    }
  `]
})
export class GameDetailComponent implements OnInit {
  private gameService = inject(GameService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  game = signal<Game | null>(null);
  pricing = signal<GamePrice[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    const gameId = this.route.snapshot.paramMap.get('id');
    if (gameId) {
      this.loadGame(gameId);
      this.loadPricing(gameId);
    }
  }

  loadGame(gameId: string): void {
    this.loading.set(true);
    this.gameService.getGameById(gameId).subscribe({
      next: (game) => {
        this.game.set(game);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading game:', error);
        this.loading.set(false);
      }
    });
  }

  loadPricing(gameId: string): void {
    this.gameService.getGamePricing(gameId).subscribe({
      next: (pricing) => {
        this.pricing.set(pricing);
      },
      error: (error) => {
        console.error('Error loading pricing:', error);
      }
    });
  }

  bookGame(): void {
    const gameId = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/booking'], { queryParams: { gameId } });
  }

  goBack(): void {
    this.router.navigate(['/games']);
  }
}
