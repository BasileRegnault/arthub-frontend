import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./dashboard/dashboard.component')
            .then(m => m.AdminDashboardComponent)
      },
      {
        path: 'artworks',
        loadComponent: () =>
          import('./pages/artworks/list/artwork-list.component').then(m => m.ArtworkListComponent)
      },
      {
        path: 'artworks/new',
        loadComponent: () =>
          import('./pages/artworks/form/artwork-form.component').then(m => m.ArtworkFormComponent)
      },
      {
        path: 'artworks/:id',
        loadComponent: () => 
          import('./pages/artworks/form/artwork-form.component').then(m => m.ArtworkFormComponent)
      },
      {
        path: 'artists',
        loadComponent: () =>
          import('./pages/artists/list/artist-list.component').then(m => m.ArtistListComponent)
      },
      {
        path: 'artists/new',
        loadComponent: () =>
          import('./pages/artists/form/artist-form.component').then(m => m.ArtistFormComponent)
      },
      {
        path: 'artists/:id',
        loadComponent: () => 
          import('./pages/artists/form/artist-form.component').then(m => m.ArtistFormComponent)
      }
    ]
  }
];
