import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

type SupportedLanguage = 'en' | 'mk';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="language-switcher">
      <button
          *ngFor="let lang of languages"
          class="lang-button"
          [class.active]="currentLang() === lang"
          (click)="switchLanguage(lang)">
        {{ lang.toUpperCase() }}
      </button>
    </div>
  `,
  styles: [`
    .language-switcher {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .lang-button {
      padding: 6px 12px;
      border: 2px solid transparent;
      border-radius: 6px;
      background: transparent;
      color: inherit;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .lang-button:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-1px);
    }

    .lang-button.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .lang-button:active {
      transform: translateY(0);
    }
  `]
})
export class LanguageSwitcherComponent {
  languages: SupportedLanguage[] = ['en', 'mk'];
  currentLang = signal<SupportedLanguage>('mk');

  constructor(private translate: TranslateService) {
    // initialize
    const init = (this.translate.currentLang as SupportedLanguage) || (this.translate.getDefaultLang() as SupportedLanguage) || 'mk';
    this.currentLang.set(init);

    // keep signal in sync with ngx-translate
    this.translate.onLangChange.subscribe(e => this.currentLang.set(e.lang as SupportedLanguage));
  }

  switchLanguage(lang: SupportedLanguage) {
    if (lang !== this.translate.currentLang) {
      this.translate.use(lang);            // <-- THIS triggers the pipe to update
      localStorage.setItem('lang', lang);  // optional
    }
  }
}
