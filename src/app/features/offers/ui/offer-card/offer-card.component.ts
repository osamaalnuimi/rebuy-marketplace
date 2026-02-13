import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Offer } from '@shared/data-access/models/offer.model';
import { VotingControlsComponent } from '@features/offers/ui/voting-controls/voting-controls.component';

@Component({
  selector: 'offer-card',

  imports: [RouterLink, CurrencyPipe, NgOptimizedImage, VotingControlsComponent],
  templateUrl: './offer-card.component.html',
  styleUrl: './offer-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferCardComponent {
  offer = input.required<Offer>();
  userVote = input<number>(0);
  priority = input<boolean>(false);

  upvoteClicked = output<void>();
  downvoteClicked = output<void>();
}
