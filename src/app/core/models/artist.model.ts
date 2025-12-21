import { Artwork } from './artwork.model';
import { MediaObject } from './mediaObject.model';

export interface Artist {
  '@id'?: string;   // IRI fournie par API Platform
  id?: number;

  firstname: string;
  lastname: string;

  bornAt: string;           // datetime ISO (DateTimeImmutable -> string)
  diedAt?: string | null;

  nationality?: string | null;
  biography?: string | null;

  profilePicture?: MediaObject;

  artworks?: Artwork[] | string[]; // expanded or IRI[]

  createdAt?: string;
  updatedAt?: string;
}


export interface SimpleArtist {
  '@id'?: string;
  id?: number;
  firstname?: string;
  lastname?: string;
}