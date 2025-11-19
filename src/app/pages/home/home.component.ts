import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {GameService} from '../../core/services/game.service';
import {Game} from '../../models/game.model';
import {LoadingComponent} from "../../shared/components/loading/loading.component";
import {ButtonComponent} from "../../shared/components/button/button.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LoadingComponent, ButtonComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
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
