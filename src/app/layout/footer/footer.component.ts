import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'rb-footer',

  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
