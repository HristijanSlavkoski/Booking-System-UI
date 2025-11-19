// src/app/core/services/promotion.service.ts
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from './api.service';
import {Promotion} from "../../models/promotion.model";

@Injectable({providedIn: 'root'})
export class PromotionService {
    private api = inject(ApiService);

    getAll(): Observable<Promotion[]> {
        return this.api.get<Promotion[]>('/promotions');
    }

    create(dto: Partial<Promotion>): Observable<Promotion> {
        return this.api.post<Promotion>('/promotions', dto);
    }

    update(id: string, dto: Partial<Promotion>): Observable<Promotion> {
        return this.api.put<Promotion>(`/promotions/${id}`, dto);
    }

    delete(id: string): Observable<void> {
        return this.api.delete<void>(`/promotions/${id}`);
    }
}
