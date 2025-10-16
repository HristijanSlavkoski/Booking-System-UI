import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameService } from '../../../core/services/game.service';
import { Game } from '../../../models/game.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-games-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent, LoadingComponent],
  template: `
    <div class="games-list-page">
      <div class="page-header">
        <h1>Our VR Games</h1>
        <p>Choose your next adventure from our collection of immersive experiences</p>
      </div>

      @if (loading()) {
        <app-loading message="Loading games..." [fullscreen]="true"></app-loading>
      } @else {
        <div class="games-container">
          @if (games().length > 0) {
            <div class="games-grid">
              @for (game of games(); track game.id) {
                <div class="game-card">
                  <div class="game-image">
                    <img [src]="game.imageUrl" [alt]="game.name" />
                    <div class="game-overlay">
                      <app-button variant="primary" (clicked)="viewGame(game.id)">
                        View Details
                      </app-button>
                      <app-button variant="success" (clicked)="bookGame(game.id)">
                        Book Now
                      </app-button>
                    </div>
                  </div>
                  <div class="game-content">
                    <div class="game-header">
                      <h2 class="game-title">{{ game.name }}</h2>
                      <span class="game-difficulty" [class]="game.difficulty.toLowerCase()">
                        {{ game.difficulty }}
                      </span>
                    </div>
                    <p class="game-description">{{ game.shortDescription }}</p>
                    <div class="game-details">
                      <div class="detail-item">
                        <span class="detail-icon">⏱️</span>
                        <span>{{ game.duration }} minutes</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-icon">👥</span>
                        <span>{{ game.minPlayers }}-{{ game.maxPlayers }} players</span>
                      </div>
                    </div>
                    @if (game.tags && game.tags.length > 0) {
                      <div class="game-tags">
                        @for (tag of game.tags; track tag) {
                          <span class="tag">{{ tag }}</span>
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state">
              <p>No games available at the moment. Please check back later!</p>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .games-list-page {
      min-height: 100vh;
      padding: 2rem;
      background: #f9fafb;
    }

    .page-header {
      text-align: center;
      max-width: 800px;
      margin: 0 auto 3rem;
    }

    .page-header h1 {
      font-size: 3rem;
      font-weight: 800;
      color: #111827;
      margin: 0 0 1rem 0;
    }

    .page-header p {
      font-size: 1.25rem;
      color: #6b7280;
      margin: 0;
    }

    .games-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .games-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 2rem;
    }

    .game-card {
      background: white;
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .game-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }

    .game-image {
      position: relative;
      width: 100%;
      height: 250px;
      overflow: hidden;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .game-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .game-card:hover .game-image img {
      transform: scale(1.1);
    }

    .game-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .game-card:hover .game-overlay {
      opacity: 1;
    }

    .game-content {
      padding: 1.5rem;
    }

    .game-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .game-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
      margin: 0;
      flex: 1;
    }

    .game-difficulty {
      padding: 0.25rem 0.75rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      white-space: nowrap;
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
      color: #6b7280;
      line-height: 1.6;
      margin: 0 0 1rem 0;
    }

    .game-details {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1rem;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #374151;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .detail-icon {
      font-size: 1.25rem;
    }

    .game-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tag {
      padding: 0.25rem 0.75rem;
      background: #f3f4f6;
      color: #374151;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #6b7280;
      font-size: 1.125rem;
    }

    @media (max-width: 768px) {
      .page-header h1 {
        font-size: 2rem;
      }

      .page-header p {
        font-size: 1rem;
      }

      .games-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class GamesListComponent implements OnInit {
  private gameService = inject(GameService);
  private router = inject(Router);

  games = signal<Game[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.loading.set(true);
    this.gameService.getActiveGames().subscribe({
      next: (games) => {
        this.games.set(games);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading games:', error);
        this.loading.set(false);
      }
    });
  }

  viewGame(gameId: string): void {
    this.router.navigate(['/games', gameId]);
  }

  bookGame(gameId: string): void {
    this.router.navigate(['/booking'], { queryParams: { gameId } });
  }
}
