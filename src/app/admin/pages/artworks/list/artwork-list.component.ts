import { Component, computed, inject, signal } from '@angular/core';
import { ApiPlatformService } from '../../../../core/services/api-platform.service';
import { Artwork } from '../../../../core/models';
import { Router, RouterLink } from '@angular/router';
import { PaginatedResult } from '../../../../core/utils/hydra';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { DateDisplayPipe } from "../../../../shared/pipes/date-display.pipe";
import { ArtworksFilterComponent } from "../filter/artworks-filter.component";
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal.component/confirm-modal.component';

@Component({
  selector: 'app-list.component',
  standalone: true,
  imports: [CommonModule, RouterLink, DateDisplayPipe, ArtworksFilterComponent, ConfirmModalComponent],
  templateUrl: './artwork-list.component.html',
  styleUrl: './artwork-list.component.scss',
})
export class ArtworkListComponent {

  // Inject services
  private api = inject(ApiPlatformService<Artwork>);
  private router = inject(Router);

  // Signals / State
  confirmModalOpen = signal(false);
  artworkToDeleteId: number | null = null;
  selectedArtworkTitle = '';

  artworks = signal<PaginatedResult<Artwork> | null>(null);
  loading = signal(false);

  page = signal(1);
  itemsPerPage = 20;

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  filters: any = {};

  // Computed
  artworksWithImages = computed(() =>
    this.artworks()?.items.map(a => ({
      ...a,
      imageUrl: a.image?.contentUrl ? environment.apiBaseUrl + a.image.contentUrl : 'assets/default-image.png'
    })) || []
  );

  hasNextPage = computed(() => {
    const current = this.artworks();
    return current ? this.page() < (current.lastPage || 1) : false;
  });

  constructor() {
    this.load();
  }

  // -----------------------------
  // Load / Pagination
  // -----------------------------
  load() {
    this.fetchArtworks(this.page());
  }

  fetchArtworks(page = 1) {
    const params = this.buildFilterParams(page);
    this.loading.set(true);

    this.api.list('artworks', page, this.itemsPerPage, params).subscribe({
      next: (res: PaginatedResult<Artwork>) => {
        this.artworks.set({
          items: res.items,
          total: res.total,
          page: res.page,
          lastPage: res.lastPage,
          itemsPerPage: this.itemsPerPage
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        alert('Erreur lors du chargement des œuvres.');
      }
    });
  }

  setPage(newPage: number) {
    this.page.set(newPage);
    this.load();
  }

  // -----------------------------
  // Filtering / Searching
  // -----------------------------
  onSearch(filters: any) {
    this.filters = filters;
    this.setPage(1);
  }

  onResetFilters() {
    this.filters = {};
    this.setPage(1);
  }

  private buildFilterParams(page: number): Record<string, any> {
    const params: Record<string, any> = { page, itemsPerPage: this.itemsPerPage };
    const f = this.filters;

    // On récupère que les oeuvres qui sont validées
    params['isConfirmCreate'] = true;
    
    if (f.title) params['title'] = f.title;
    if (f.artist) params['artist'] = `/api/artists/${f.artist.id}`;
    if (f.type) params['type'] = f.type;
    if (f.style) params['style'] = f.style;
    if (f.location) params['location'] = f.location;
    if (f.fromDate) params['creationDate[after]'] = f.fromDate;
    if (f.toDate) params['creationDate[before]'] = f.toDate;
    if (f.isDisplay !== '' && f.isDisplay !== null) params['isDisplay'] = f.isDisplay;

    return params;
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

    const current = this.artworks();
    if (!current) return;

    const sortedItems = [...current.items].sort((a, b) => {
      const aVal = a[column as keyof Artwork] ?? '';
      const bVal = b[column as keyof Artwork] ?? '';
      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.artworks.set({ ...current, items: sortedItems, page: current.page ?? this.page() });
  }

  // -----------------------------
  // Artwork actions
  // -----------------------------
  getAverageRating(art: Artwork): string {
    if (!art.ratings || (art.ratings as any[]).length === 0) return '—';
    const ratings = art.ratings as any[];
    const avg = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
    return avg.toFixed(1);
  }

  onEdit(id?: number) {
    if (!id) return;
    this.router.navigate(['/admin/artworks', id]);
  }

  onViewDetails(id?: number) {
    if (!id) return;
    this.router.navigate(['/admin/artworks', id]);
  }

  onPreview(id?: number) {
    if (!id) return;
    this.router.navigate(['/admin/artworks', id]);
  }

  onDelete(id?: number, title: string = '') {
    this.artworkToDeleteId = id ?? null;
    this.selectedArtworkTitle = title ?? '';
    this.confirmModalOpen.set(true);
  }

  handleConfirmDelete() {
    if (!this.artworkToDeleteId) return;

    this.api.delete('artworks', this.artworkToDeleteId).subscribe({
      next: () => {
        this.load();
        this.artworkToDeleteId = null;
      },
      error: () => alert('Erreur lors de la suppression.')
    });

    this.confirmModalOpen.set(false);
  }

  handleCancelDelete() {
    this.artworkToDeleteId = null;
    this.confirmModalOpen.set(false);
  }
}
