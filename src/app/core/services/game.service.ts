import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Game, GamePrice, GameAvailability } from '../../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiService = inject(ApiService);

  getAllGames(): Observable<Game[]> {
    return this.apiService.get<Game[]>('/games');
  }

  getActiveGames(): Observable<Game[]> {
    return this.apiService.get<Game[]>('/games/active');
  }

  getGameById(id: string): Observable<Game> {
    return this.apiService.get<Game>(`/games/${id}`);
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
}
