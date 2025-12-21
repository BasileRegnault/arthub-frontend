import { Artist } from './artist.model';
import { Gallery } from './gallery.model';
import { Rating } from './rating.model';
import { ArtworkType } from './enum/artwork-type.enum';
import { ArtworkStyle } from './enum/artwork-style.enum';
import { MediaObject } from './mediaObject.model';

export interface Artwork {
  '@id'?: string;
  id?: number;

  title: string;

  type: ArtworkType;
  style: ArtworkStyle;

  creationDate: string; // ISO datetime

  description: string;

  image?: MediaObject;
  location?: string | null;

  views?: number | null;

  artist: Artist;// IRI or expanded Artist

  isDisplay: boolean;

  galleries?: Gallery[] | string[];
  ratings?: Rating[] | string[];

  createdAt?: string;
  updatedAt?: string;
}
