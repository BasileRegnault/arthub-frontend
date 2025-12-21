import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiPlatformService } from '../../../../core/services/api-platform.service';
import { Artist } from '../../../../core/models';
import { PaginatedResult } from '../../../../core/utils/hydra';
import { ArtistsFilterComponent } from '../filter/artist-filter.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal.component/confirm-modal.component';
import { environment } from '../../../../environments/environment';
import { DateDisplayPipe } from '../../../../shared/pipes/date-display.pipe';

@Component({
  selector: 'app-artist-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DateDisplayPipe, ArtistsFilterComponent, ConfirmModalComponent],
  templateUrl: './artist-list.component.html',
})
export class ArtistListComponent {
  private api = inject(ApiPlatformService<Artist>);
  private router = inject(Router);

  confirmModalOpen = signal(false);
  artistToDeleteId: number | null = null;
  selectedArtistName = '';

  artists = signal<PaginatedResult<Artist> | null>(null);
  loading = signal(false);

  page = signal(1);
  itemsPerPage = 20;

  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  filters: any = {};

  constructor() {
    this.load();
  }

  load() {
    this.fetchArtists(this.page());
  }

  fetchArtists(page = 1) {
    const params = { page, itemsPerPage: this.itemsPerPage, ...this.filters };
    this.loading.set(true);
    this.api.list('artists', page, this.itemsPerPage, params).subscribe({
      next: res => {
        this.artists.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setPage(newPage: number) {
    this.page.set(newPage);
    this.load();
  }

  onSearch(filters: any) {
    this.filters = filters;
    this.setPage(1);
  }

  onResetFilters() {
    this.filters = {};
    this.setPage(1);
  }

  onEdit(id?: number) {
    if (!id) return;
    this.router.navigate(['/admin/artists', id]);
  }

  onDelete(id?: number, name = '') {
    this.artistToDeleteId = id ?? null;
    this.selectedArtistName = name;
    this.confirmModalOpen.set(true);
  }

  onViewDetails(id?: number) {
    if (!id) return;
    this.router.navigate(['/admin/artworks', id]);
  }

  onPreview(id?: number) {
    if (!id) return;
    this.router.navigate(['/admin/artworks', id]);
  }


    // -----------------------------
    // Sorting
    // -----------------------------
    sortBy(column: string) {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
  
      const current = this.artists();
      if (!current) return;
  
      const sortedItems = [...current.items].sort((a, b) => {
        const aVal = a[column as keyof Artist] ?? '';
        const bVal = b[column as keyof Artist] ?? '';
        if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  
      this.artists.set({ ...current, items: sortedItems, page: current.page ?? this.page() });
    }

  handleConfirmDelete() {
    if (!this.artistToDeleteId) return;
    this.api.delete('artists', this.artistToDeleteId).subscribe({
      next: () => this.load(),
      error: () => alert('Erreur lors de la suppression.')
    });
    this.confirmModalOpen.set(false);
  }

  handleCancelDelete() {
    this.artistToDeleteId = null;
    this.confirmModalOpen.set(false);
  }

  artistsWithProfilePictures = computed(() =>
    this.artists()?.items.map(a => ({
      ...a,
      profilePictureUrl: a.profilePicture?.contentUrl ? environment.apiBaseUrl + a.profilePicture.contentUrl : 'assets/default-image.png'
    })) || []
  );

  hasNextPage = computed(() => this.page() < (this.artists()?.lastPage || 1));
}
