// core/services/pricing.service.ts
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from './api.service';

export interface PricingPreview {
    basePrice: number;
    finalPrice: number;
    discountAmount: number;
    discountFraction: number;
    promotionName?: string | null;
}

@Injectable({providedIn: 'root'})
export class PricingService {
    private api = inject(ApiService);

    previewPrice(gameId: string, date: string, players: number): Observable<PricingPreview> {
        const encodedGameId = encodeURIComponent(gameId);
        const encodedDate = encodeURIComponent(date);
        const encodedPlayers = encodeURIComponent(players.toString());

        return this.api.get<PricingPreview>(
            `/pricing/preview?gameId=${encodedGameId}&date=${encodedDate}&players=${encodedPlayers}`
        );
    }
}
