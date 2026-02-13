import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'offer-info',
  imports: [DatePipe],
  templateUrl: './offer-info.component.html',
  styleUrl: './offer-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferInfoComponent {
  condition = input.required<string>();
  category = input.required<string>();
  seller = input.required<string>();
  createdAt = input.required<Date>();
}
