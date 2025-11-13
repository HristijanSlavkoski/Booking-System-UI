import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {appConfig} from './app/app.config';
import { registerLocaleData } from '@angular/common';
import localeMk from '@angular/common/locales/mk';

registerLocaleData(localeMk);
bootstrapApplication(AppComponent, appConfig)
    .catch(err => console.error(err));
