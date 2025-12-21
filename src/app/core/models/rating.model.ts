import { User } from './user.model';
import { Artwork } from './artwork.model';

export interface Rating {
  '@id'?: string;
  id?: number;

  score: number; // float (0–5)
  comment?: string | null;

  author: User | string;   // note : l'entité PHP s'appelle "author"
  artwork: Artwork | string;

  createdAt?: string;
  updatedAt?: string;
}
