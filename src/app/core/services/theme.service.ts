// theme.service.ts
import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private currentTheme = 'dark';

    setTheme(theme: 'dark' | 'green' | 'blue' | 'light') {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
    }

    getCurrentTheme(): string {
        return this.currentTheme;
    }
}
