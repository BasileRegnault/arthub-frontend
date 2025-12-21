import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ArtworkStyle, ArtworkType, SimpleArtist } from '../../../../core/models';
import { ApiPlatformService } from '../../../../core/services/api-platform.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { FileUploadComponent } from "../../../../shared/components/file-upload.component/file-upload.component";
import { AppFormFieldComponent } from "../../../../shared/components/app-form-field.component/app-form-field.component";
import { BackButtonComponent } from "../../../../shared/components/back-button.component/back-button.component";
import { AppArtistAutocompleteComponent } from '../../../../shared/components/app-artist-autocomplete.component/app-artist-autocomplete.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal.component/confirm-modal.component';
import { ArtworkFormControls } from '../../../../core/models/form/artwork.form.model';

@Component({
  selector: 'app-artwork-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    FileUploadComponent, AppFormFieldComponent, BackButtonComponent,
    AppArtistAutocompleteComponent, ConfirmModalComponent
  ],
  templateUrl: './artwork-form.component.html',
})
export class ArtworkFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiPlatformService<any>);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  isEdit = false;
  editingId: string | null = null;

  // File upload
  fileSignal = signal<File | null>(null);
  previewUrl = signal<string | null>(null);

  // Loading / submitting
  loading = signal(false);
  submitting = signal(false);

  // Delete modal
  confirmModalOpen = signal(false);
  artworkToDeleteId: number | null = null;
  selectedArtworkTitle = '';

  // Form
  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    type: ['', Validators.required],
    style: ['', Validators.required],
    creationDate: ['', Validators.required],
    description: ['', Validators.maxLength(500)],
    image: [''],
    location: [''],
    artist: [null as SimpleArtist | null, Validators.required],
    isDisplay: [true],
  });

  types = Object.values(ArtworkType);
  styles = Object.values(ArtworkStyle);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editingId = id;
      this.loadArtwork(id);
    }
  }

  loadArtwork(id: string) {
    this.loading.set(true);
    this.api.get('artworks', id).subscribe({
      next: (data: any) => {
        this.form.patchValue({
          title: data.title,
          type: data.type,
          style: data.style,
          creationDate: data.creationDate?.slice(0,10) ?? '',
          description: data.description,
          image: data.image ?? '',
          location: data.location ?? '',
          artist: data.artist ?? null,
          isDisplay: data.isDisplay ?? true,
        });

        if (data.image?.contentUrl) {
          this.previewUrl.set(environment.apiBaseUrl + data.image.contentUrl);
          this.form.controls['image'].setValue(data.image['@id']);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onPreviewUpdate(file: File | null) {
    this.previewUrl.set(file ? URL.createObjectURL(file) : null);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const file = this.fileSignal();

    const proceed = (imageIri: string | null) => {
      const payload = {
        title: this.form.value.title,
        type: this.form.value.type,
        style: this.form.value.style,
        creationDate: this.form.value.creationDate,
        description: this.form.value.description,
        location: this.form.value.location,
        artist: this.form.value.artist ? `/api/artists/${this.form.value.artist.id}` : null,
        isDisplay: this.form.value.isDisplay,
        image: imageIri,
      };

      const request$ = this.isEdit && this.editingId
        ? this.api.patch('artworks', this.editingId, payload)
        : this.api.create('artworks', payload);

      request$.subscribe({
        next: () => {
          this.submitting.set(false);
          this.toast.show("Le formulaire est bon", "success");
          this.router.navigate(['/admin/artworks']);
        },
        error: (err: any) => {
          this.submitting.set(false);
          if (err.error && typeof err.error === 'object') {
            Object.keys(err.error).forEach(key => {
              if (key in this.form.controls) {
                (this.form.controls as unknown as ArtworkFormControls)[key as keyof ArtworkFormControls]
                  .setErrors({ server: err.error[key] });
              }
            });
          } else {
            this.toast.show("Erreur lors de la soumission", "error");
          }
        }
      });
    };

    if (!file) {
      proceed(this.form.value.image ?? null);
      return;
    }

    this.uploadMediaObject(file).subscribe({
      next: (media: any) => proceed(media['@id']),
      error: () => {
        this.submitting.set(false);
        alert("Erreur lors de l'upload de l'image");
      }
    });
  }

  // Delete
  onDelete() {
    this.artworkToDeleteId = this.editingId ? parseInt(this.editingId, 10) : null;
    this.selectedArtworkTitle = this.form.value.title as string;
    this.confirmModalOpen.set(true);
  }

  handleConfirmDelete() {
    if (!this.artworkToDeleteId) return;

    this.api.delete('artworks', this.artworkToDeleteId).subscribe({
      next: () => this.router.navigate(['/admin/artworks']),
      error: () => alert('Erreur lors de la suppression.')
    });

    this.confirmModalOpen.set(false);
  }

  handleCancelDelete() {
    this.artworkToDeleteId = null;
    this.confirmModalOpen.set(false);
  }

  uploadMediaObject(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    return this.api.create('media_objects', fd);
  }
}
