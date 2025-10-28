// src/app/shared/layout/shell.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    standalone: true,
    selector: 'app-shell',
    imports: [RouterOutlet, HeaderComponent, FooterComponent, TranslateModule],
    template: `
    <app-header></app-header>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `,
    styles: [`
    .main-content { min-height: calc(100vh - 200px); display:block; }
  `]
})
export class ShellComponent {}
