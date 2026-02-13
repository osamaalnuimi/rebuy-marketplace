import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'offer-image',
  imports: [NgOptimizedImage],
  templateUrl: './offer-image.component.html',
  styleUrl: './offer-image.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferImageComponent {
  imageUrl = input.required<string>();
  alt = input.required<string>();
  condition = input.required<string>();
  priority = input<boolean>(false);
}
