import { Injectable, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type SupportedLanguage = 'en' | 'mk';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translations: Record<string, any> = {};
  currentLang = signal<SupportedLanguage>('en');

  constructor(private http: HttpClient) {
    const savedLang = localStorage.getItem('language') as SupportedLanguage;
    if (savedLang && (savedLang === 'en' || savedLang === 'mk')) {
      this.currentLang.set(savedLang);
    }

    effect(() => {
      const lang = this.currentLang();
      this.loadTranslations(lang);
      localStorage.setItem('language', lang);
    });
  }

  async loadTranslations(lang: SupportedLanguage): Promise<void> {
    try {
      const translations = await firstValueFrom(
        this.http.get(`/assets/i18n/${lang}.json`)
      );
      this.translations = translations || {};
    } catch (error) {
      console.error(`Failed to load translations for ${lang}`, error);
      this.translations = {};
    }
  }

  translate(key: string): string {
    const keys = key.split('.');
    let value: any = this.translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  }

  switchLanguage(lang: SupportedLanguage): void {
    this.currentLang.set(lang);
  }

  getAvailableLanguages(): SupportedLanguage[] {
    return ['en', 'mk'];
  }
}
