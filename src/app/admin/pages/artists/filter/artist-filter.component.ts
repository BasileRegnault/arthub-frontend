import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-artists-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './artist-filter.component.html',
})
export class ArtistsFilterComponent {
  @Output() search = new EventEmitter<any>();
  @Output() reset = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  form = this.fb.group({
    firstname: [''],
    lastname: [''],
    nationality: [''],
    bornAtFrom: [''],
    bornAtTo: [''],
    diedAtFrom: [''],
    diedAtTo: [''],
  });

  submit() {
    this.search.emit(this.form.value);
  }

  resetFilters() {
    this.form.reset({
      firstname: '',
      lastname: '',
      nationality: '',
      bornAtFrom: '',
      bornAtTo: '',
      diedAtFrom: '',
      diedAtTo: '',
    });
    this.reset.emit();
  }
}
