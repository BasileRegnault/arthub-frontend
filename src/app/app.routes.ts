import { provideRouter, Routes } from '@angular/router';
import { HOME_ROUTES } from './features/home/home.routes';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => HOME_ROUTES
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes)
  },
];

export const appRouterProviders = [ provideRouter(routes) ];
