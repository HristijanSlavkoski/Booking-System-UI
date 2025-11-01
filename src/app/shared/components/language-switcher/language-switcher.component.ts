import {Component, OnDestroy, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs';

export type SupportedLanguage = 'en' | 'mk';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss']
})
export class LanguageSwitcherComponent implements OnDestroy {
  languages: SupportedLanguage[] = ['en', 'mk'];
  currentLang = signal<SupportedLanguage>('en');

  private langSub?: Subscription;

  constructor(private translate: TranslateService) {
    // Prefer stored lang, then current, then default, then 'en'
    const stored = (localStorage.getItem('lang') as SupportedLanguage) || null;
    const init =
        stored ||
        (this.translate.currentLang as SupportedLanguage) ||
        (this.translate.getDefaultLang() as SupportedLanguage) ||
        'en';

    this.currentLang.set(init);
    if (this.translate.currentLang !== init) {
      this.translate.use(init);
    }

    // Keep signal in sync with ngx-translate events
    this.langSub = this.translate.onLangChange.subscribe(e => {
      this.currentLang.set(e.lang as SupportedLanguage);
    });
  }

  switchLanguage(lang: SupportedLanguage) {
    if (lang !== this.translate.currentLang) {
      this.translate.use(lang);            // triggers translate pipe updates
      localStorage.setItem('lang', lang);  // optional persistence
    }
  }

  ngOnDestroy() {
    this.langSub?.unsubscribe();
  }
}
