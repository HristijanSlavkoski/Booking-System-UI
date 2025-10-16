import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-config',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-config">
      <h1>System Configuration</h1>
      <p>Configuration settings will be displayed here.</p>
    </div>
  `,
  styles: [`
    .admin-config {
      padding: 2rem;
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
  `]
})
export class AdminConfigComponent {}
