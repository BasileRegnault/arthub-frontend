import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app-form-field.component.html',
  styleUrl: './app-form-field.component.scss',
})
export class AppFormFieldComponent {
  @Input() label!: string;
  @Input() control!: FormControl;
  @Input() type: 'text' | 'textarea' | 'select' | 'date' | 'toggle' = 'text';
  @Input() options: any[] = [];
  @Input() errorMessage: string = 'Champ requis';
  @Input() placeholder?: string;

  getErrorMessage(): string {
    if (!this.control.errors) return '';
    if (this.control.errors['required']) return `${this.label} est requis`;
    if (this.control.errors['maxlength']) return `${this.label} est trop long`;
    if (this.control.errors['server']) return `${this.control.errors['server']}`;
    return `${this.label} est invalide`;
  }
}
