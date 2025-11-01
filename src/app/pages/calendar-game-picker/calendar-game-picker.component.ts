// // src/app/pages/calendar-only/calendar-game-picker.component.ts
// import {Component, EventEmitter, inject, OnInit, Output, signal} from '@angular/core';
// import {CommonModule} from '@angular/common';
// import {TranslatePipe, TranslateService} from '@ngx-translate/core';
// import {Game} from '../../models/game.model';
// import {GameService} from '../../core/services/game.service';
//
// @Component({
//     selector: 'app-calendar-game-picker',
//     standalone: true,
//     imports: [CommonModule, TranslatePipe],
//     template: `
//         <div class="gpp-wrap">
//             <div class="gpp-header">
//                 <div class="gpp-title">{{ 'calendar.chooseGame' | translate }}</div>
//                 <input class="gpp-search"
//                        [placeholder]="'calendar.searchGames' | translate"
//                        [value]="query()"
//                        (input)="query.set(($event.target as HTMLInputElement).value)"/>
//             </div>
//
//             <div class="gpp-body">
//                 @if (loading()) {
//                     <div class="gpp-loading">{{ 'common.loading' | translate }}</div>
//                 } @else if (filtered().length === 0) {
//                     <div class="gpp-empty">{{ 'calendar.noGames' | translate }}</div>
//                 } @else {
//                     <div class="gpp-grid">
//                         @for (g of filtered(); track g.id) {
//                             <div class="gpp-card" (click)="pick(g)" tabindex="0" (keyup.enter)="pick(g)">
//                                 <img *ngIf="g.imageUrl" [src]="g.imageUrl" alt="" class="gpp-img"/>
//                                 <div class="gpp-meta">
//                                     <div class="gpp-name">{{ g.name }}</div>
//                                     <div class="gpp-sub">
//                                         @if (g.duration) {
//                                             <span>{{ g.duration }} {{ 'calendar.minutes' | translate }}</span>
//                                         }
//                                         @if (g.minPlayers && g.maxPlayers) {
//                                             <span> · {{ g.minPlayers }}
//                                                 –{{ g.maxPlayers }} {{ 'calendar.players' | translate }}</span>
//                                         }
//                                     </div>
//                                     @if (g.shortDescription) {
//                                         <div class="gpp-desc">{{ g.shortDescription }}</div>
//                                     }
//                                 </div>
//                             </div>
//                         }
//                     </div>
//                 }
//             </div>
//
//             <div class="gpp-footer">
//                 <button class="gpp-back" (click)="back.emit()">{{ 'common.back' | translate }}</button>
//             </div>
//         </div>
//     `,
//     styles: [`
//         .gpp-wrap {
//             display: flex;
//             flex-direction: column;
//             gap: 1rem
//         }
//
//         .gpp-header {
//             display: flex;
//             gap: .75rem;
//             align-items: center
//         }
//
//         .gpp-title {
//             font-weight: 600;
//             font-size: 1.1rem
//         }
//
//         .gpp-search {
//             flex: 1;
//             padding: .5rem .75rem;
//             border: 1px solid #ddd;
//             border-radius: .5rem
//         }
//
//         .gpp-body {
//         }
//
//         .gpp-loading, .gpp-empty {
//             padding: 1rem;
//             color: #666
//         }
//
//         .gpp-grid {
//             display: grid;
//             grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));
//             gap: 1rem
//         }
//
//         .gpp-card {
//             border: 1px solid #eee;
//             border-radius: .75rem;
//             overflow: hidden;
//             cursor: pointer;
//             outline: none
//         }
//
//         .gpp-card:focus {
//             box-shadow: 0 0 0 3px rgba(0, 0, 0, .08)
//         }
//
//         .gpp-img {
//             width: 100%;
//             height: 140px;
//             object-fit: cover;
//             display: block
//         }
//
//         .gpp-meta {
//             padding: .75rem
//         }
//
//         .gpp-name {
//             font-weight: 600;
//             margin-bottom: .35rem
//         }
//
//         .gpp-sub {
//             color: #666;
//             font-size: .9rem
//         }
//
//         .gpp-desc {
//             margin-top: .35rem;
//             color: #444;
//             font-size: .9rem;
//             line-height: 1.35
//         }
//
//         .gpp-footer {
//             display: flex;
//             justify-content: flex-start
//         }
//
//         .gpp-back {
//             padding: .5rem .9rem;
//             border: 1px solid #ddd;
//             border-radius: .5rem;
//             background: #fff;
//             cursor: pointer
//         }
//     `]
// })
// export class CalendarGamePickerComponent implements OnInit {
//     private gameService = inject(GameService);
//     private i18n = inject(TranslateService);
//
//     @Output() select = new EventEmitter<Game>();
//     @Output() back = new EventEmitter<void>();
//
//     loading = signal(false);
//     games = signal<Game[]>([]);
//     query = signal('');
//
//     ngOnInit(): void {
//         this.loading.set(true);
//         this.gameService.getActiveGames().subscribe({
//             next: list => {
//                 this.games.set(list);
//                 this.loading.set(false);
//             },
//             error: () => {
//                 this.games.set([]);
//                 this.loading.set(false);
//             }
//         });
//     }
//
//     filtered() {
//         const q = this.query().trim().toLowerCase();
//         if (!q) return this.games();
//         return this.games().filter(g =>
//             g.name?.toLowerCase().includes(q) ||
//             g.shortDescription?.toLowerCase().includes(q)
//         );
//     }
//
//     pick(g: Game) {
//         this.select.emit(g);
//     }
//
//     protected readonly HTMLInputElement = HTMLInputElement;
// }
