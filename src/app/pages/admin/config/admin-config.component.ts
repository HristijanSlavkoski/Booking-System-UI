// src/app/pages/admin/config/admin-config.component.ts
import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NotificationService} from '../../../core/services/notification.service';
import {Game} from '../../../models/game.model';
import {GameService} from '../../../core/services/game.service';
import {Promotion} from '../../../models/promotion.model';
import {PromotionService} from '../../../core/services/promotion.service';
import {PricingService} from '../../../core/services/pricing.service';
import {GiftCardPeekResponse, GiftCardService} from "../../../core/services/gift-card.service";
import {ButtonComponent} from "../../../shared/components/button/button.component";
import {LoadingComponent} from "../../../shared/components/loading/loading.component";

type ConfigTab = 'pricing' | 'promotions' | 'holidays' | 'giftcards';

@Component({
    selector: 'app-admin-config',
    standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, LoadingComponent],
    templateUrl: './admin-config.component.html',
    styleUrls: ['./admin-config.component.scss']
})
export class AdminConfigComponent implements OnInit {
    private notificationService = inject(NotificationService);
    private gameService = inject(GameService);
    private promotionService = inject(PromotionService);
    private giftCardService = inject(GiftCardService);
    private pricingService = inject(PricingService);

    // ───────────────── Tabs ────────────────
    activeTab = signal<ConfigTab>('promotions');

    setTab(tab: ConfigTab): void {
        this.activeTab.set(tab);
    }

    // ───────────────── Shared data ─────────
    games = signal<Game[]>([]);
    loadingGames = signal(false);

    // ───────────────── Pricing preview ─────
    pricingLoading = signal(false);
    pricingGameId = signal<string>('');
    pricingDate = signal<string>('');
    pricingPlayers = signal<number | null>(null);
    pricingResult = signal<any | null>(null);

    // ───────────────── Promotions ──────────
    promotions = signal<Promotion[]>([]);
    promotionsLoading = signal(false);
    promotionsSaving = signal(false);

    showPromoForm = signal(false);
    editingPromoId = signal<string | null>(null);

    promoForm: Partial<Promotion> = {
        name: '',
        description: '',
        discount: 0,
        validFrom: '',
        validTo: '',
        active: true,
        game: undefined
    };

    // ───────────────── Gift cards ──────────
    giftCode = signal<string>('');
    giftLoading = signal(false);
    giftResult = signal<GiftCardPeekResponse | null>(null);

    ngOnInit(): void {
        this.loadGames();
        this.loadPromotions();
    }

    // ───────────────── Games ───────────────
    loadGames(): void {
        this.loadingGames.set(true);
        this.gameService.getAllGames().subscribe({
            next: games => {
                this.games.set(games ?? []);
                this.loadingGames.set(false);
            },
            error: err => {
                console.error('Error loading games', err);
                this.notificationService.error('Failed to load games list');
                this.loadingGames.set(false);
            }
        });
    }

    // ───────────────── Pricing preview ─────
    previewPrice(): void {
        const gameId = this.pricingGameId();
        const date = this.pricingDate();
        const players = this.pricingPlayers();

        if (!gameId || !date || !players || players <= 0) {
            this.notificationService.error('Please select game, date and number of players.');
            return;
        }

        this.pricingLoading.set(true);
        this.pricingService.previewPrice(gameId, date, players).subscribe({
            next: res => {
                this.pricingResult.set(res);
                this.pricingLoading.set(false);
            },
            error: err => {
                console.error('Pricing preview error', err);
                this.notificationService.error('Failed to load pricing preview');
                this.pricingLoading.set(false);
            }
        });
    }

    // ───────────────── Promotions ──────────
    loadPromotions(): void {
        this.promotionsLoading.set(true);
        this.promotionService.getAll().subscribe({
            next: list => {
                this.promotions.set(list ?? []);
                this.promotionsLoading.set(false);
            },
            error: err => {
                console.error('Error loading promotions', err);
                this.notificationService.error('Failed to load promotions');
                this.promotionsLoading.set(false);
            }
        });
    }

    startCreatePromotion(): void {
        this.editingPromoId.set(null);
        this.showPromoForm.set(true);
        this.promoForm = {
            name: '',
            description: '',
            discount: 0,
            validFrom: '',
            validTo: '',
            active: true,
            game: undefined
        };
    }

    startEditPromotion(p: Promotion): void {
        this.editingPromoId.set(p.id);
        this.showPromoForm.set(true);
        this.promoForm = {
            id: p.id,
            name: p.name,
            description: p.description,
            discount: p.discount,
            validFrom: p.validFrom,
            validTo: p.validTo,
            active: p.active,
            game: p.game ?? undefined
        };
    }

    cancelPromotionForm(): void {
        if (this.promotionsSaving()) return;
        this.showPromoForm.set(false);
        this.editingPromoId.set(null);
    }

    isPromotionFormValid(): boolean {
        const f = this.promoForm;
        return !!(
            f.name &&
            f.discount != null &&
            f.validFrom &&
            f.validTo
        );
    }

    savePromotion(): void {
        if (!this.isPromotionFormValid()) return;

        this.promotionsSaving.set(true);
        const id = this.editingPromoId();

        const payload: Partial<Promotion> = {
            ...this.promoForm,
            // ensure numbers
            discount: Number(this.promoForm.discount)
        };

        if (id) {
            this.promotionService.update(id, payload).subscribe({
                next: () => {
                    this.notificationService.success('Promotion updated');
                    this.promotionsSaving.set(false);
                    this.showPromoForm.set(false);
                    this.editingPromoId.set(null);
                    this.loadPromotions();
                },
                error: err => {
                    console.error('Update promo error', err);
                    this.notificationService.error('Failed to update promotion');
                    this.promotionsSaving.set(false);
                }
            });
        } else {
            this.promotionService.create(payload).subscribe({
                next: () => {
                    this.notificationService.success('Promotion created');
                    this.promotionsSaving.set(false);
                    this.showPromoForm.set(false);
                    this.loadPromotions();
                },
                error: err => {
                    console.error('Create promo error', err);
                    this.notificationService.error('Failed to create promotion');
                    this.promotionsSaving.set(false);
                }
            });
        }
    }

    deletePromotion(p: Promotion): void {
        if (!confirm(`Delete promotion "${p.name}"?`)) return;

        this.promotionService.delete(p.id).subscribe({
            next: () => {
                this.notificationService.success('Promotion deleted');
                this.loadPromotions();
            },
            error: err => {
                console.error('Delete promo error', err);
                this.notificationService.error('Failed to delete promotion');
            }
        });
    }

    getGameLabelForPromo(p: Promotion): string {
        if (!p.game?.id) return 'All games';
        if (p.game.name) return p.game.name;

        const g = this.games().find(g => g.id === p.game?.id);
        return g?.name ?? p.game.id;
    }

    // ───────────────── Gift cards ──────────
    peekGiftCard(): void {
        const code = this.giftCode().trim();
        if (!code) {
            this.notificationService.error('Please enter a gift card code');
            return;
        }

        this.giftLoading.set(true);
        this.giftResult.set(null);

        this.giftCardService.peek(code).subscribe({
            next: res => {
                this.giftResult.set(res);
                this.giftLoading.set(false);
            },
            error: err => {
                console.error('Gift card peek error', err);
                this.notificationService.error('Gift card not found or not usable');
                this.giftLoading.set(false);
            }
        });
    }
}
