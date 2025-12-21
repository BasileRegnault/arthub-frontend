import { Gallery } from './gallery.model';
import { Rating } from './rating.model';

export interface User {
  '@id'?: string;
  id?: number;

  username: string;
  email: string;

  roles: string[]; // list<string> en PHP -> string[]

  profilePicture?: string | null;

  galleries?: Gallery[] | string[];
  ratings?: Rating[] | string[];

  createdAt?: string;
  updatedAt?: string;
}
