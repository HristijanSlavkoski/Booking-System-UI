import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {Game, GamePrice} from '../../../models/game.model';
import {GameService} from '../../../core/services/game.service';
import {ButtonComponent} from '../../../shared/components/button/button.component';
import {LoadingComponent} from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, ButtonComponent, LoadingComponent],
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.scss']
})
export class GameDetailComponent implements OnInit {
  private gameService = inject(GameService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

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
      error: (err) => {
        console.error('Error loading game:', err);
        this.loading.set(false);
      }
    });
  }

  loadPricing(gameId: string): void {
    // If/when you have pricing API – fill here.
    this.pricing.set([]);
  }

  bookGame(): void {
    const gameId = this.route.snapshot.paramMap.get('id');
    if (gameId) {
      this.router.navigate(['/booking'], {queryParams: {gameId}});
    }
  }

  goBack(): void {
    this.router.navigate(['/games']);
  }

  getDifficultyLabel(difficulty?: number | null): string {
    if (difficulty == null) return 'Unknown';

    if (difficulty <= 2) return 'Easy';
    if (difficulty === 3) return 'Medium';
    if (difficulty === 4) return 'Hard';
    if (difficulty >= 5) return 'Expert';

    return 'Unknown';
  }

  getDifficultyClass(difficulty?: number | null): string {
    if (difficulty == null) return 'difficulty-unknown';

    if (difficulty <= 2) return 'difficulty-easy';
    if (difficulty === 3) return 'difficulty-medium';
    if (difficulty === 4) return 'difficulty-hard';
    if (difficulty >= 5) return 'difficulty-expert';

    return 'difficulty-unknown';
  }
}
