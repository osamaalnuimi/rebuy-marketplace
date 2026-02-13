import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Offer } from '@shared/data-access/models/offer.model';

@Component({
  selector: 'purchase-modal',

  imports: [CurrencyPipe],
  templateUrl: './purchase-modal.component.html',
  styleUrl: './purchase-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseModalComponent {
  offer = input.required<Offer>();
  isSuccess = input<boolean>(false);

  confirm = output<void>();
  closeModal = output<void>();

  onOverlayClick(): void {
    this.closeModal.emit();
  }

  onModalClick(event: Event): void {
    event.stopPropagation();
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onClose(): void {
    this.closeModal.emit();
  }
}
