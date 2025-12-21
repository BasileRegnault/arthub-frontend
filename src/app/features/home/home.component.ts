import { Component, OnInit, signal } from '@angular/core';
import { ApiPlatformService } from '../../core/services/api-platform.service';
import { Artwork } from '../../core/models';
import { ArtworkCardComponent } from "../artworks/components/artwork-card.component";

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [ArtworkCardComponent],
})
export class HomeComponent implements OnInit {
  artworks = signal<Artwork[]>([]);

  constructor(private api: ApiPlatformService<Artwork>) {}

  ngOnInit() {
    this.api.list('/api/artworks', 1, 9).subscribe(res => {
      this.artworks.set(res.items);
    });
  }
}