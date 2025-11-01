import {Component, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() size: 'normal' | 'large' = 'normal';
  @Input() showFooter = true;
  @Input() closeOnOverlayClick = true;

  @Output() closed = new EventEmitter<void>();

  // Close on ESC when open
  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen) this.close();
  }

  close(): void {
    this.isOpen = false;
    this.closed.emit();
  }

  onOverlayClick(): void {
    if (this.closeOnOverlayClick) {
      this.close();
    }
  }
}
