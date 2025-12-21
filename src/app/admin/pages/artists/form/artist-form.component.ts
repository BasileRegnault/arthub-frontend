import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiPlatformService } from '../../../../core/services/api-platform.service';
import { Artist } from '../../../../core/models';
import { ToastService } from '../../../../shared/services/toast.service';
import { FileUploadComponent } from '../../../../shared/components/file-upload.component/file-upload.component';
import { BackButtonComponent } from '../../../../shared/components/back-button.component/back-button.component';
import { environment } from '../../../../environments/environment';
import { AppFormFieldComponent } from '../../../../shared/components/app-form-field.component/app-form-field.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal.component/confirm-modal.component';

@Component({
  selector: 'app-artist-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileUploadComponent, BackButtonComponent, AppFormFieldComponent, ConfirmModalComponent],
  templateUrl: './artist-form.component.html',
})
export class ArtistFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiPlatformService<Artist>);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  isEdit = false;
  editingId: string | null = null;

  fileSignal = signal<File | null>(null);
  previewUrl = signal<string | null>(null);

  loading = signal(false);
  submitting = signal(false);

  // Delete modal
  confirmModalOpen = signal(false);
  artistToDeleteId: number | null = null;
  selectedArtistName = '';

  form = this.fb.group({
    firstname: ['', [Validators.required, Validators.minLength(2)]],
    lastname: ['', [Validators.required, Validators.minLength(2)]],
    nationality: [''],
    bornAt: ['', Validators.required],
    diedAt: [''],
    biography: [''],
    profilePicture: [''],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editingId = id;
      this.loadArtist(id);
    }
  }

  loadArtist(id: string) {
    this.loading.set(true);
    this.api.get('artists', id).subscribe({
      next: data => {
        this.form.patchValue({
          firstname: data.firstname,
          lastname: data.lastname,
          nationality: data.nationality,
          bornAt: data.bornAt?.slice(0,10),
          diedAt: data.diedAt?.slice(0,10),
          biography: data.biography,
          profilePicture: data.profilePicture?.['@id'] || ''
        });
        if (data.profilePicture?.contentUrl) {
          this.previewUrl.set(environment.apiBaseUrl + data.profilePicture.contentUrl);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onPreviewUpdate(file: File | null) {
    this.previewUrl.set(file ? URL.createObjectURL(file) : null);
    this.fileSignal.set(file);
  }

  submit() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    const file = this.fileSignal();

    const proceed = (profilePictureIri: string | null) => {
      const payload = { ...this.form.value, profilePicture: profilePictureIri };
      const request$ = this.isEdit && this.editingId
        ? this.api.patch('artists', this.editingId, payload)
        : this.api.create('artists', payload);

      request$.subscribe({
        next: () => {
          this.submitting.set(false);
          this.toast.show('Artiste enregistré', 'success');
          this.router.navigate(['/admin/artists']);
        },
        error: () => this.submitting.set(false)
      });
    };

    
    if (!file) return proceed(this.form.value.profilePicture ?? null);

    this.uploadMediaObject(file).subscribe({
      next: media => proceed(media['@id']),
      error: () => {
        this.submitting.set(false);
        alert("Erreur lors de l'upload de l'image");
      }
    });
  }

  uploadMediaObject(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    return this.api.create('media_objects', fd);
  }

  // Delete
  onDelete() {
    this.artistToDeleteId = this.editingId ? parseInt(this.editingId, 10) : null;
    this.selectedArtistName = this.form.value.firstname as string;
    this.confirmModalOpen.set(true);
  }

  handleConfirmDelete() {
    if (!this.artistToDeleteId) return;

    this.api.delete('artists', this.artistToDeleteId).subscribe({
      next: () => this.router.navigate(['/admin/artists']),
      error: () => alert('Erreur lors de la suppression.')
    });

    this.confirmModalOpen.set(false);
  }

  handleCancelDelete() {
    this.artistToDeleteId = null;
    this.confirmModalOpen.set(false);
  }
}
