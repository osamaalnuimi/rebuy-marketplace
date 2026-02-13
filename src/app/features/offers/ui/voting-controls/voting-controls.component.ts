import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'voting-controls',

  templateUrl: './voting-controls.component.html',
  styleUrl: './voting-controls.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VotingControlsComponent {
  votes = input.required<number>();
  userVote = input<number>(0);

  upvote = output<void>();
  downvote = output<void>();

  onUpvote(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.upvote.emit();
  }

  onDownvote(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.downvote.emit();
  }
}
