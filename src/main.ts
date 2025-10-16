import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
    providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideTranslateService({
            // v17 way to wire the HTTP loader + its config
            loader: provideTranslateHttpLoader({
                prefix: 'assets/i18n/',   // your folder
                suffix: '.json',           // your files extension
                // optional extras:
                // enforceLoading: true,   // cache-bust
                // useHttpBackend: true,   // bypass interceptors
            }),
            // v17 prefers "fallback" terminology
            fallbackLang: 'mk',
        }),
    ],
}).catch(err => console.error(err));
