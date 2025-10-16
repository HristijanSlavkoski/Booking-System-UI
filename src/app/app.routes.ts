import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'games',
    loadComponent: () => import('./pages/games/games-list/games-list.component').then(m => m.GamesListComponent)
  },
  {
    path: 'games/:id',
    loadComponent: () => import('./pages/games/game-detail/game-detail.component').then(m => m.GameDetailComponent)
  },
  {
    path: 'booking',
    loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/user/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'my-bookings',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/user/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'schedule',
        loadComponent: () => import('./pages/admin/schedule/admin-schedule.component').then(m => m.AdminScheduleComponent)
      },
      {
        path: 'bookings',
        loadComponent: () => import('./pages/admin/bookings/admin-bookings.component').then(m => m.AdminBookingsComponent)
      },
      {
        path: 'games',
        loadComponent: () => import('./pages/admin/games/admin-games.component').then(m => m.AdminGamesComponent)
      },
      {
        path: 'config',
        loadComponent: () => import('./pages/admin/config/admin-config.component').then(m => m.AdminConfigComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
