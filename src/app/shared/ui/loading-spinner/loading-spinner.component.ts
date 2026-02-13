import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'rb-loading-spinner',

  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinnerComponent {
  message = input<string>('Loading...');
}
