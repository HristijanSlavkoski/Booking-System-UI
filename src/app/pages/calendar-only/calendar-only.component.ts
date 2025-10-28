// calendar-only.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CalendarComponent, SlotSelection } from '../../shared/components/calendar/calendar.component';
import { ConfigService } from '../../core/services/config.service';
import { GameService } from '../../core/services/game.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Game } from "../../models/game.model";

@Component({
  selector: 'app-calendar-only',
  standalone: true,
  imports: [CommonModule, CalendarComponent, TranslatePipe],
  template: `
    <div class="calendar-only-page">
      <div class="calendar-header">
        <h1 class="title">{{ 'calendar.title' | translate }}</h1>
        <p class="subtitle">{{ 'calendar.subtitle' | translate }}</p>
      </div>

      <app-calendar
        [lang]="lang()"
        [gameId]="gameId()"
        [gameData]="game()"
        [maxConcurrentBookings]="maxConcurrentBookings()"
        (slotSelected)="onSlotSelected($event)"
        (gamePickRequested)="onGamePickRequested($event)">
      </app-calendar>

      <!-- Simple Game Picker Modal (only when user clicked slot without a game) -->
      @if (showGamePicker()) {
        <div class="game-picker-backdrop" (click)="closeGamePicker()"></div>
        <div class="game-picker-modal" (click)="$event.stopPropagation()">
          <div class="gpm-header">
            <div class="gpm-title">{{ 'calendar.chooseGame' | translate }}</div>
            <button class="gpm-close" (click)="closeGamePicker()">✕</button>
          </div>

          <div class="gpm-list">
            @if (gamesLoading()) {
              <div class="gpm-loading">{{ 'common.loading' | translate }}</div>
            }
            @for (g of games(); track g.id) {
              <div class="gpm-item" (click)="selectGame(g)">
                <img *ngIf="g.imageUrl" [src]="g.imageUrl" alt="" />
                <div class="gpm-meta">
                  <div class="gpm-name">{{ g.name }}</div>
                  <div class="gpm-sub">
                    @if (g.duration) { <span>{{ g.duration }} min</span> }
                    @if (g.minPlayers && g.maxPlayers) {
                      <span> · {{ g.minPlayers }}–{{ g.maxPlayers }} {{ 'calendar.players' | translate }}</span>
                    }
                  </div>
                  @if (g.shortDescription) { <div class="gpm-desc">{{ g.shortDescription }}</div> }
                </div>
              </div>
            }
            @if (!gamesLoading() && games().length === 0) {
              <div class="gpm-empty">{{ 'calendar.noGames' | translate }}</div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .calendar-only-page { min-height: 100vh; background: #0a0a0a; padding: 2rem; }
    .calendar-header { text-align: center; margin-bottom: 2rem; }
    .title { font-size: 2.5rem; font-weight: 800; color: #ffffff; margin: 0 0 0.5rem 0; text-transform: uppercase; letter-spacing: 2px; }
    .subtitle { font-size: 1.125rem; color: #aaa; margin: 0; }
    @media (max-width: 768px) {
      .calendar-only-page { padding: 1rem; }
      .title { font-size: 1.75rem; }
      .subtitle { font-size: 1rem; }
    }
    /* Game Picker Modal styles */
    .game-picker-backdrop {
      position:fixed; inset:0; background:rgba(0,0,0,.6); z-index:1000;
    }
    .game-picker-modal {
      position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
      width:min(900px, 96vw); max-height:80vh; overflow:auto;
      background:#121212; border:1px solid #2a2a2a; border-radius:.75rem;
      box-shadow:0 10px 40px rgba(0,0,0,.6); z-index:1001; padding:1rem;
    }
    .gpm-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:.5rem; }
    .gpm-title { color:#fff; font-weight:800; font-size:1.2rem; }
    .gpm-close { background:transparent; color:#aaa; border:none; font-size:1.2rem; cursor:pointer; }
    .gpm-list { display:flex; flex-direction:column; gap:.5rem; }
    .gpm-item {
      display:flex; gap:1rem; padding:.75rem; border:1px solid #2a2a2a; border-radius:.5rem;
      background:#1a1a1a; cursor:pointer; transition:.2s;
    }
    .gpm-item:hover { border-color:#ec3f3a; transform:translateY(-1px); }
    .gpm-item img { width:72px; height:72px; object-fit:cover; border-radius:.5rem; }
    .gpm-meta { color:#fff; }
    .gpm-name { font-weight:700; }
    .gpm-sub { color:#bbb; font-size:.9rem; margin-top:.15rem; }
    .gpm-desc { color:#aaa; margin-top:.35rem; font-size:.9rem; line-height:1.35; }
    .gpm-loading, .gpm-empty { color:#aaa; text-align:center; padding:1rem; }
  `]
})
export class CalendarOnlyComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private configService = inject(ConfigService);
  private gameService = inject(GameService);
  private i18n = inject(TranslateService);

  maxConcurrentBookings = signal(2);
  gameId = signal<string>('');
  lang = signal<'en' | 'mk'>('en');

  // Loaded game (for the banner in <app-calendar>)
  game = signal<Game | null>(null);

  // Game picker UI
  showGamePicker = signal(false);
  games = signal<Game[]>([]);
  gamesLoading = signal(false);

  // Keep the clicked date/time when no game was selected
  pendingSlot = signal<{ date: string; time: string } | null>(null);

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap;

    // language from wordpress (?lang=en|mk), default 'en'
    const lang = (qp.get('lang') || qp.get('locale') || 'en').toLowerCase();
    this.lang.set(lang === 'mk' ? 'mk' : 'en');
    this.i18n.use(this.lang());

    // gameId from wordpress (?gameId=...)
    const gid = qp.get('gameId') ?? '';
    this.gameId.set(gid);

    // preload game banner if gid exists
    if (gid) {
      this.gameService.getGameByCode(gid).subscribe({
        next: (g) => this.game.set(g),
        error: () => this.game.set(null)
      });
    }

    // load config
    this.configService.loadConfig().subscribe({
      next: (config) => {
        this.maxConcurrentBookings.set(config.maxConcurrentBookings);
      }
    });
  }

  onSlotSelected(slot: SlotSelection): void {
    // Continue to booking with params + lang (+ gameId if present)
    const queryParams: any = {
      date: slot.date,
      time: slot.time,
      rooms: slot.rooms,
      lang: this.lang()
    };
    if (this.gameId()) {
      queryParams.gameId = this.gameId();
    }
    this.router.navigate(['/booking'], { queryParams });
  }

  // Fired by <app-calendar> when no gameId is set and user clicked an available slot
  onGamePickRequested(e: { date: string; time: string }): void {
    this.pendingSlot.set({ date: e.date, time: e.time });
    this.openGamePicker();
  }

  private openGamePicker(): void {
    this.showGamePicker.set(true);
    if (this.games().length === 0) {
      this.gamesLoading.set(true);
      // Adjust this endpoint/params to your API (e.g., /games?status=ACTIVE)
      this.gameService.getActiveGames().subscribe({
        next: (list) => { this.games.set(list); this.gamesLoading.set(false); },
        error: () => { this.games.set([]); this.gamesLoading.set(false); }
      });
    }
  }

  closeGamePicker(): void {
    this.showGamePicker.set(false);
    // keep pendingSlot; user might reopen
  }

  selectGame(g: Game): void {
    // Save selection → calendar now has a gameId so future clicks open rooms modal
    this.gameId.set(g.code);
    this.game.set(g);
    this.showGamePicker.set(false);

    // (Optional) you can auto-navigate or auto-open room modal via a @ViewChild on <app-calendar>.
    // Simpler: let the user click the same slot again now that a game is selected.
  }
}
