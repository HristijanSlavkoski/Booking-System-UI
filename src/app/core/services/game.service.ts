import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { MockDataService } from './mock-data.service';
import { Game, GamePrice, GameAvailability } from '../../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiService = inject(ApiService);
  private mockDataService = inject(MockDataService);

  getAllGames(): Observable<Game[]> {
    return this.apiService.get<Game[]>('/games');
  }

  getActiveGames(): Observable<Game[]> {
    return this.apiService.get<Game[]>('/games/active').pipe(
      catchError(() => of(this.mockDataService.getGames()))
    );
  }

  getGameById(id: string): Observable<Game> {
    return this.apiService.get<Game>(`/games/${id}`).pipe(
      catchError(() => {
        const game = this.mockDataService.getGameById(id);
        return game ? of(game) : of({} as Game);
      })
    );
  }

  createGame(game: Partial<Game>): Observable<Game> {
    return this.apiService.post<Game>('/games', game);
  }

  updateGame(id: string, game: Partial<Game>): Observable<Game> {
    return this.apiService.put<Game>(`/games/${id}`, game);
  }

  deleteGame(id: string): Observable<void> {
    return this.apiService.delete<void>(`/games/${id}`);
  }

  getGamePricing(gameId: string): Observable<GamePrice[]> {
    return this.apiService.get<GamePrice[]>(`/games/${gameId}/pricing`).pipe(
      catchError(() => of(this.mockDataService.getGamePricing(gameId)))
    );
  }

  updateGamePricing(gameId: string, pricing: GamePrice[]): Observable<GamePrice[]> {
    return this.apiService.put<GamePrice[]>(`/games/${gameId}/pricing`, pricing);
  }

  getGameAvailability(gameId: string, date: string): Observable<GameAvailability> {
    return this.apiService.get<GameAvailability>(`/games/${gameId}/availability`, { date });
  }
}
