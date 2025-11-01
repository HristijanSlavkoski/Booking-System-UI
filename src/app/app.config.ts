import {APP_INITIALIZER, ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';
import {provideTranslateService} from '@ngx-translate/core';
import {provideTranslateHttpLoader} from '@ngx-translate/http-loader';

import {routes} from './app.routes';
import {ConfigService} from './core/services/config.service';
import {BookingStore} from './shared/stores/booking.store';
import {firstValueFrom} from 'rxjs';

function initPricingFactory(cfg: ConfigService, store: BookingStore) {
    return () =>
        firstValueFrom(cfg.loadConfig())
            .then(config => {
                const tiers = (config?.pricingConfig?.tiers ?? []).map((t: any) => ({
                    minPlayers: Number(t.minPlayers),
                    maxPlayers: Number(t.maxPlayers),
                    pricePerPlayer: Number(t.pricePerPlayer),
                }));
                const tax = Number(config?.taxPercentage ?? 0);
                const maxConc = Number(config?.maxConcurrentBookings ?? 2);
                store.setPricingConfig(tiers, tax, maxConc);
            })
            .catch(() => store.setPricingConfig([], 0, 2));
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideTranslateService({
            loader: provideTranslateHttpLoader({
                prefix: 'assets/i18n/',
                suffix: '.json',
            }),
            fallbackLang: 'en',
        }),
        {
            provide: APP_INITIALIZER,
            multi: true,
            deps: [ConfigService, BookingStore],
            useFactory: initPricingFactory,
        },
    ],
};
