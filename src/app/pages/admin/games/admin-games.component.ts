import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-games',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-games">
      <h1>Manage Games</h1>
      <p>Games management interface will be displayed here.</p>
    </div>
  `,
  styles: [`
    .admin-games {
      padding: 2rem;
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
  `]
})
export class AdminGamesComponent {}
