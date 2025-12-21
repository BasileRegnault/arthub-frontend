import { Component, Input } from '@angular/core';
import { Artwork } from '../../../core/models/artwork.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-artwork-card',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './artwork-card.component.html',
})
export class ArtworkCardComponent {
  @Input() artwork!: Artwork;

}
