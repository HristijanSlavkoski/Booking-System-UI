import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="input-wrapper">
      <label *ngIf="label" [for]="id" class="input-label">
        {{ label }}
        <span *ngIf="required" class="required">*</span>
      </label>
      <input
        [id]="id"
        [type]="type"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [required]="required"
        [(ngModel)]="value"
        (blur)="onTouched()"
        class="input-field"
        [class.error]="error"
      />
      <span *ngIf="error" class="error-message">{{ error }}</span>
    </div>
  `,
  styles: [`
    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
    }

    .input-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
    }

    .required {
      color: #dc3545;
    }

    .input-field {
      padding: 0.75rem;
      font-size: 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      transition: all 0.3s ease;
      width: 100%;
    }

    .input-field:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .input-field.error {
      border-color: #dc3545;
    }

    .input-field:disabled {
      background: #f3f4f6;
      cursor: not-allowed;
    }

    .error-message {
      font-size: 0.875rem;
      color: #dc3545;
    }
  `]
})
export class InputComponent implements ControlValueAccessor {
  @Input() id = `input-${Math.random().toString(36).substr(2, 9)}`;
  @Input() label = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'time' = 'text';
  @Input() placeholder = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() error = '';

  value = '';
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
