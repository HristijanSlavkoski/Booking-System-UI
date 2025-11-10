import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';

export interface PricingPreview {
    basePrice: number;
    finalPrice: number;
    discountAmount: number;
    discountFraction: number;
    promotionName?: string | null;
}

@Injectable({providedIn: 'root'})
export class PricingService {
    private http = inject(HttpClient);
    // Adjust baseUrl if you have a global API prefix (e.g. environment.apiUrl)
    private readonly baseUrl = '/api/pricing';

    previewPrice(gameId: string, date: string, players: number): Observable<PricingPreview> {
        const params = new HttpParams()
            .set('gameId', gameId)
            .set('date', date)        // yyyy-MM-dd (PlayersComponent already has this format)
            .set('players', players.toString());

        return this.http.get<PricingPreview>(`${this.baseUrl}/preview`, {params});
    }
}
