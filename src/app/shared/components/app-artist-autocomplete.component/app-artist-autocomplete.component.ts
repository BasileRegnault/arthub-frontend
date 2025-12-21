import { Component, inject, OnInit, signal, computed, forwardRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, map, of } from 'rxjs';
import { ApiPlatformService } from '../../../core/services/api-platform.service';
import { SimpleArtist } from '../../../core/models';

@Component({
  selector: 'app-artist-autocomplete',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app-artist-autocomplete.component.html',
  styleUrls: ['./app-artist-autocomplete.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppArtistAutocompleteComponent),
      multi: true
    }
  ]
})
export class AppArtistAutocompleteComponent implements OnInit, ControlValueAccessor {

  private api = inject(ApiPlatformService<SimpleArtist>);

  inputControl = new FormControl('');
  allArtists = signal<SimpleArtist[]>([]); // cache local
  remoteArtists = signal<SimpleArtist[]>([]); // résultats distants
  showDropdown = signal(false);
  loading = signal(false);

  value: SimpleArtist | null = null;
  private onChange: (value: SimpleArtist | null) => void = () => {};
  protected onTouched: () => void = () => {};

  ngOnInit() {
    // Pré-chargement local si besoin (optionnel)
    this.api.list('artists', 1, 100).subscribe(res => {
      this.allArtists.set(res.items);
    });

    // Gestion de l'autocomplete
    this.inputControl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(val => this.filterArtists(val))
    ).subscribe(res => {
      this.remoteArtists.set(res);
      this.loading.set(false);
    });
  }

  private filterArtists(val: string | SimpleArtist | null) {
    if (!val || typeof val !== 'string' || val.trim().length < 2) {
      this.remoteArtists.set([]);
      return of([]);
    }

    const query = val.trim().toLowerCase();

    // 1️⃣ Filtre local
    const localResults = this.allArtists().filter(a =>
      (a.firstname ?? '').toLowerCase().includes(query) ||
      (a.lastname ?? '').toLowerCase().includes(query)
    );

    // 2️⃣ Si pas assez de résultats, filtrage distant
    if (localResults.length >= 10) {
      return of(localResults);
    }

    this.loading.set(true);

    // Filtre distant via API Platform
    return this.api.list('artists', 1, 20, { 
      'firstname': query, 
      'lastname': query 
    }).pipe(
      map(res => {
        const remoteOnly = res.items.filter(r => !localResults.find(l => l.id === r.id));
        return [...localResults, ...remoteOnly];
      })
    );
  }

  selectArtist(artist: SimpleArtist) {
    this.value = artist;
    this.inputControl.setValue(`${artist.firstname} ${artist.lastname}`, { emitEvent: false });
    this.showDropdown.set(false);
    this.remoteArtists.set([]);
    this.onChange(artist);
  }

  displayFn(artist: SimpleArtist | null) {
    return artist ? `${artist.firstname} ${artist.lastname}` : '';
  }

  // ControlValueAccessor
  writeValue(obj: SimpleArtist | null): void {
    this.value = obj;
    this.inputControl.setValue(this.displayFn(obj), { emitEvent: false });
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.inputControl.disable() : this.inputControl.enable();
  }

  // résultats combinés
  get results() {
    return computed(() => this.remoteArtists());
  }
}
