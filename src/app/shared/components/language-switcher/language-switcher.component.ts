import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService, SupportedLanguage } from '../../../core/services/translation.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="language-switcher">
      @for (lang of languages; track lang) {
        <button
          class="lang-button"
          [class.active]="translationService.currentLang() === lang"
          (click)="switchLanguage(lang)">
          {{ getLangLabel(lang) }}
        </button>
      }
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
  translationService = inject(TranslationService);
  languages: SupportedLanguage[] = ['en', 'mk'];

  switchLanguage(lang: SupportedLanguage): void {
    this.translationService.switchLanguage(lang);
  }

  getLangLabel(lang: SupportedLanguage): string {
    return lang.toUpperCase();
  }
}
