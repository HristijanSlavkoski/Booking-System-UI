// core/services/gift-card.service.ts
import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

export interface GiftCardPeekResponse {
    code: string;
    amount: number;      // backend will send this
    status: string;      // e.g. ACTIVE, USED, HELD, etc.
}

@Injectable({providedIn: 'root'})
export class GiftCardUiService {
    private http = inject(HttpClient);
    // TODO: fix this, it should not hardcode /api
    private baseUrl = '/api'; // adjust to your backend prefix

    peek(code: string): Observable<GiftCardPeekResponse> {
        return this.http.get<GiftCardPeekResponse>(
            `${this.baseUrl}/gift-cards/peek`,
            {params: {code}}
        );
    }
}
