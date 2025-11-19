// core/services/gift-card.service.ts
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from './api.service';

export interface GiftCardPeekResponse {
    code: string;
    amount: number;
    status: string;
}

@Injectable({providedIn: 'root'})
export class GiftCardService {
    private api = inject(ApiService);

    peek(code: string): Observable<GiftCardPeekResponse> {
        const encoded = encodeURIComponent(code.trim());
        return this.api.get<GiftCardPeekResponse>(`/gift-cards/peek?code=${encoded}`);
    }
}
