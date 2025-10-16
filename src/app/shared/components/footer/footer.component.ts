import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-section">
          <h3 class="footer-title">VR Escape</h3>
          <p class="footer-description">
            Experience the ultimate VR escape room adventure.
            Book your immersive experience today!
          </p>
        </div>

        <div class="footer-section">
          <h4 class="section-title">Quick Links</h4>
          <ul class="footer-links">
            <li><a routerLink="/">Home</a></li>
            <li><a routerLink="/games">Games</a></li>
            <li><a routerLink="/booking">Book Now</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4 class="section-title">Contact</h4>
          <ul class="footer-contact">
            <li>Email: info&#64;vrescape.com</li>
            <li>Phone: +389 XX XXX XXX</li>
            <li>Address: Skopje, Macedonia</li>
          </ul>
        </div>

        <div class="footer-section">
          <h4 class="section-title">Hours</h4>
          <ul class="footer-hours">
            <li>Monday - Friday: 9:00 - 22:00</li>
            <li>Saturday: 10:00 - 23:00</li>
            <li>Sunday: 10:00 - 20:00</li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} VR Escape. All rights reserved.</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #1f2937;
      color: #e5e7eb;
      margin-top: auto;
    }

    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 3rem 2rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .footer-title {
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 1rem;
    }

    .footer-description {
      color: #9ca3af;
      line-height: 1.6;
    }

    .section-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: white;
    }

    .footer-links,
    .footer-contact,
    .footer-hours {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-links li,
    .footer-contact li,
    .footer-hours li {
      margin-bottom: 0.5rem;
    }

    .footer-links a {
      color: #9ca3af;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .footer-links a:hover {
      color: #667eea;
    }

    .footer-contact li,
    .footer-hours li {
      color: #9ca3af;
      font-size: 0.875rem;
    }

    .footer-bottom {
      border-top: 1px solid #374151;
      padding: 1.5rem 2rem;
      text-align: center;
      color: #9ca3af;
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .footer-container {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
