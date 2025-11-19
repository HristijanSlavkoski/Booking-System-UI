import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {Game} from '../../../models/game.model';
import {GameService} from '../../../core/services/game.service';
import {ButtonComponent} from '../../../shared/components/button/button.component';
import {LoadingComponent} from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-games-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent, LoadingComponent],
  templateUrl: './games-list.component.html',
  styleUrls: ['./games-list.component.scss']
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
      error: (err) => {
        console.error('Error loading games:', err);
        this.loading.set(false);
      }
    });
  }

  viewGame(gameId: string): void {
    this.router.navigate(['/games', gameId]);
  }

  bookGame(gameCode: string): void {
    this.router.navigate(['/booking'], {queryParams: {gameId: gameCode}});
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
