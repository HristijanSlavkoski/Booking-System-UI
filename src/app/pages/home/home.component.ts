import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameService } from '../../core/services/game.service';
import { Game } from '../../models/game.model';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ButtonComponent, LoadingComponent],
  template: `
    <div class="home">
      <section class="hero">
        <div class="hero-content">
          <h1 class="hero-title">Experience Virtual Reality Like Never Before</h1>
          <p class="hero-subtitle">
            Immerse yourself in thrilling VR escape room adventures.
            Challenge your mind, test your teamwork, and escape reality.
          </p>
          <div class="hero-buttons">
            <app-button size="large" (clicked)="navigateToBooking()">
              Book Now
            </app-button>
            <app-button variant="outline" size="large" (clicked)="navigateToGames()">
              View Games
            </app-button>
          </div>
        </div>
        <div class="hero-image">
          <div class="hero-image-placeholder"></div>
        </div>
      </section>

      <section class="features">
        <div class="features-container">
          <div class="feature-card">
            <div class="feature-icon">🎮</div>
            <h3>Immersive Experience</h3>
            <p>State-of-the-art VR technology for the ultimate gaming experience</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">👥</div>
            <h3>Team Adventures</h3>
            <p>Perfect for groups of 2-6 players. Great for friends and family!</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🏆</div>
            <h3>Multiple Challenges</h3>
            <p>Various difficulty levels and themes to suit all skill levels</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">⏰</div>
            <h3>Easy Booking</h3>
            <p>Quick and simple online booking system with instant confirmation</p>
          </div>
        </div>
      </section>

      <section class="games-preview">
        <div class="section-header">
          <h2 class="section-title">Featured Games</h2>
          <p class="section-subtitle">Check out our most popular VR escape experiences</p>
        </div>

        @if (loading()) {
          <app-loading message="Loading games..."></app-loading>
        } @else if (games().length > 0) {
          <div class="games-grid">
            @for (game of games(); track game.id) {
              <div class="game-card" (click)="navigateToGame(game.id)">
                <div class="game-image">
                  <img [src]="game.imageUrl" [alt]="game.name" />
                </div>
                <div class="game-content">
                  <h3 class="game-title">{{ game.name }}</h3>
                  <p class="game-description">{{ game.shortDescription }}</p>
                  <div class="game-meta">
                    <span class="game-duration">{{ game.duration }} min</span>
                    <span class="game-players">{{ game.minPlayers }}-{{ game.maxPlayers }} players</span>
                  </div>
                  <div class="game-difficulty" [class]="game.difficulty.toLowerCase()">
                    {{ game.difficulty }}
                  </div>
                </div>
              </div>
            }
          </div>
          <div class="view-all-container">
            <app-button variant="outline" (clicked)="navigateToGames()">
              View All Games
            </app-button>
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .home {
      min-height: 100vh;
    }

    .hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4rem 2rem;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
    }

    .hero-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .hero-title {
      font-size: 3rem;
      font-weight: 800;
      line-height: 1.2;
      margin: 0;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      line-height: 1.6;
      opacity: 0.9;
    }

    .hero-buttons {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .hero-image-placeholder {
      width: 100%;
      height: 400px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 1rem;
      backdrop-filter: blur(10px);
    }

    .features {
      padding: 4rem 2rem;
      background: #f9fafb;
    }

    .features-container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      text-align: center;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .feature-card h3 {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      color: #111827;
    }

    .feature-card p {
      color: #6b7280;
      line-height: 1.6;
      margin: 0;
    }

    .games-preview {
      padding: 4rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .section-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .section-title {
      font-size: 2.5rem;
      font-weight: 800;
      color: #111827;
      margin: 0 0 1rem 0;
    }

    .section-subtitle {
      font-size: 1.125rem;
      color: #6b7280;
      margin: 0;
    }

    .games-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .game-card {
      background: white;
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .game-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }

    .game-image {
      width: 100%;
      height: 200px;
      overflow: hidden;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .game-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .game-content {
      padding: 1.5rem;
    }

    .game-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
      margin: 0 0 0.5rem 0;
    }

    .game-description {
      color: #6b7280;
      line-height: 1.6;
      margin: 0 0 1rem 0;
    }

    .game-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .game-difficulty {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
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

    .view-all-container {
      text-align: center;
    }

    @media (max-width: 768px) {
      .hero {
        grid-template-columns: 1fr;
        padding: 2rem 1rem;
      }

      .hero-title {
        font-size: 2rem;
      }

      .hero-subtitle {
        font-size: 1rem;
      }

      .hero-buttons {
        flex-direction: column;
      }

      .hero-image-placeholder {
        height: 250px;
      }

      .section-title {
        font-size: 1.75rem;
      }

      .games-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  private gameService = inject(GameService);
  private router = inject(Router);

  games = signal<Game[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loadFeaturedGames();
  }

  loadFeaturedGames(): void {
    this.loading.set(true);
    this.gameService.getActiveGames().subscribe({
      next: (games) => {
        this.games.set(games.slice(0, 3));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading games:', error);
        this.loading.set(false);
      }
    });
  }

  navigateToBooking(): void {
    this.router.navigate(['/booking']);
  }

  navigateToGames(): void {
    this.router.navigate(['/games']);
  }

  navigateToGame(id: string): void {
    this.router.navigate(['/games', id]);
  }
}
