// src/app/pages/admin/games/admin-games.component.ts
import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Game} from '../../../models/game.model';
import {GameService} from '../../../core/services/game.service';
import {NotificationService} from '../../../core/services/notification.service';
import {ButtonComponent} from '../../../shared/components/button/button.component';
import {LoadingComponent} from '../../../shared/components/loading/loading.component';
import {TranslatePipe} from "@ngx-translate/core";

@Component({
    selector: 'app-admin-games',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonComponent, LoadingComponent, TranslatePipe],
    templateUrl: './admin-games.component.html',
    styleUrls: ['./admin-games.component.scss']
})
export class AdminGamesComponent implements OnInit {
    private gameService = inject(GameService);
    private notificationService = inject(NotificationService);

    games = signal<Game[]>([]);
    loading = signal(false);
    saving = signal(false);

    showForm = signal(false);
    editingId = signal<string | null>(null);

    // form model (partial, enough for create/update)
    formModel: Partial<Game> = {
        name: '',
        code: '',
        description: '',
        shortDescription: '',
        imageUrl: '',
        duration: 60,
        minPlayers: 2,
        maxPlayers: 6,
        difficulty: 3,
        active: true,
        tags: []
    };

    // comma-separated tags in the UI
    tagsInput = signal<string>('');

    ngOnInit(): void {
        this.loadGames();
    }

    loadGames(): void {
        this.loading.set(true);
        this.gameService.getAllGames().subscribe({
            next: (games) => {
                this.games.set(games ?? []);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading games:', err);
                this.notificationService.error('Failed to load games');
                this.loading.set(false);
            }
        });
    }

    startCreate(): void {
        this.editingId.set(null);
        this.showForm.set(true);
        this.formModel = {
            name: '',
            code: '',
            description: '',
            shortDescription: '',
            imageUrl: '',
            duration: 60,
            minPlayers: 2,
            maxPlayers: 6,
            difficulty: 3,
            active: true,
            tags: []
        };
        this.tagsInput.set('');
    }

    startEdit(game: Game): void {
        this.editingId.set(game.id);
        this.showForm.set(true);

        this.formModel = {
            ...game
        };

        this.tagsInput.set(game.tags?.join(', ') || '');
    }

    cancelForm(): void {
        if (this.saving()) return;
        this.showForm.set(false);
        this.editingId.set(null);
    }

    isFormValid(): boolean {
        const m = this.formModel;
        return !!(
            m.name &&
            m.code &&
            m.description &&
            m.duration &&
            m.minPlayers &&
            m.maxPlayers &&
            m.difficulty
        );
    }

    saveGame(): void {
        if (!this.isFormValid()) return;

        const tags = this.tagsInput()
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);

        const payload: Partial<Game> = {
            ...this.formModel,
            tags
        };

        const id = this.editingId();

        this.saving.set(true);

        if (id) {
            // update existing
            this.gameService.updateGame(id, payload).subscribe({
                next: () => {
                    this.notificationService.success('Game updated successfully');
                    this.saving.set(false);
                    this.showForm.set(false);
                    this.editingId.set(null);
                    this.loadGames();
                },
                error: (err) => {
                    console.error('Update game error:', err);
                    this.notificationService.error('Failed to update game');
                    this.saving.set(false);
                }
            });
        } else {
            // create new
            this.gameService.createGame(payload).subscribe({
                next: () => {
                    this.notificationService.success('Game created successfully');
                    this.saving.set(false);
                    this.showForm.set(false);
                    this.loadGames();
                },
                error: (err) => {
                    console.error('Create game error:', err);
                    this.notificationService.error('Failed to create game');
                    this.saving.set(false);
                }
            });
        }
    }

    toggleActive(game: Game): void {
        const currentlyActive = (game as any).isActive ?? (game as any).active;

        if (currentlyActive) {
            // deactivate via dedicated endpoint
            this.gameService.deactivateGame(game.id).subscribe({
                next: () => {
                    this.notificationService.success('Game deactivated');
                    this.loadGames();
                },
                error: (err) => {
                    console.error('Deactivate game error:', err);
                    this.notificationService.error('Failed to deactivate game');
                }
            });
        } else {
            // "activate" by updating isActive flag
            const payload: Partial<Game> = {
                ...game,
                active: true
            };

            this.gameService.updateGame(game.id, payload).subscribe({
                next: () => {
                    this.notificationService.success('Game activated');
                    this.loadGames();
                },
                error: (err) => {
                    console.error('Activate game error:', err);
                    this.notificationService.error('Failed to activate game');
                }
            });
        }
    }

    deleteGame(game: Game): void {
        if (!confirm(`Delete game "${game.name}"? This cannot be undone.`)) {
            return;
        }

        this.gameService.deleteGame(game.id).subscribe({
            next: () => {
                this.notificationService.success('Game deleted');
                this.loadGames();
            },
            error: (err) => {
                console.error('Delete game error:', err);
                this.notificationService.error('Failed to delete game');
            }
        });
    }

    getDifficultyLabel(d: number | undefined): string {
        if (d == null) return 'Unknown';
        const map: Record<number, string> = {
            1: 'Very Easy',
            2: 'Easy',
            3: 'Medium',
            4: 'Hard',
            5: 'Expert'
        };
        return map[d] ?? `Level ${d}`;
    }

    getDifficultyClass(d: number | undefined): string {
        if (d == null) return 'difficulty-unknown';
        if (d <= 2) return 'difficulty-easy';
        if (d === 3) return 'difficulty-medium';
        if (d === 4) return 'difficulty-hard';
        return 'difficulty-expert';
    }

    isActive(game: Game): boolean {
        return (game as any).active ?? (game as any).active ?? false;
    }
}
