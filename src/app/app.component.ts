// app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationComponent, TranslateModule],
  template: `
    <router-outlet></router-outlet>
    <app-notification></app-notification>
  `,
})
export class AppComponent {
  constructor(private ts: TranslateService) {
    ts.addLangs(['en', 'mk']);
    ts.setDefaultLang('en');
    ts.use('en');
  }
}
