import {Component, forwardRef, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
    selector: 'app-input',
    standalone: true,
    imports: [CommonModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputComponent),
            multi: true
        }
    ],
    templateUrl: './input.component.html',
    styleUrls: ['./input.component.scss']
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

    // Functions provided by Angular Forms
    private onChange: (val: any) => void = () => {
    };
    private onTouched: () => void = () => {
    };

    // Called by Angular to write a value to the view
    writeValue(value: any): void {
        this.value = value ?? '';
    }

    // Save the callbacks
    registerOnChange(fn: (val: any) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    // Disable/enable from form API
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    // Local handlers
    onValueChange(val: string): void {
        this.value = val;
        this.onChange(val); // <-- important: notify Angular forms
    }

    onBlur(): void {
        this.onTouched();
    }

    protected readonly HTMLInputElement = HTMLInputElement;
}
