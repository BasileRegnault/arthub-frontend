import { User } from './user.model';
import { Artwork } from './artwork.model';

export interface Gallery {
  '@id'?: string;
  id?: number;

  name: string;
  description?: string | null;

  coverImage?: string | null;
  views?: number | null;

  isPublic: boolean;

  owner: User | string; // IRI or expanded User

  artworks?: Artwork[] | string[];

  createdAt?: string;
  updatedAt?: string;
}
