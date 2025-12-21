import { Component, EventEmitter, Output, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { ArtworkStyle, ArtworkType, SimpleArtist } from '../../../../core/models';
import { AppArtistAutocompleteComponent } from '../../../../shared/components/app-artist-autocomplete.component/app-artist-autocomplete.component';

@Component({
  selector: 'app-artworks-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppArtistAutocompleteComponent],
  templateUrl: './artworks-filter.component.html',
})
export class ArtworksFilterComponent {
  types = Object.values(ArtworkType);
  styles = Object.values(ArtworkStyle);

  @Output() search = new EventEmitter<any>();
  @Output() reset = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  form = this.fb.group({
    title: [''],
    artist: [null as SimpleArtist | null],
    type: [''],
    style: [''],
    location: [''],
    fromDate: [''],
    toDate: [''],
    isDisplay: [''] as ['' | true | false],
  });

  submit() {
    this.search.emit(this.form.value);
  }

  resetFilters() {
    this.form.reset({
      title: '',
      artist: null,
      type: '',
      style: '',
      location: '',
      fromDate: '',
      toDate: '',
      isDisplay: '',
    });
    this.reset.emit();
  }

  setIsDisplay(value: '' | true | false) {
    this.form.controls.isDisplay.setValue(value);
  }
}
