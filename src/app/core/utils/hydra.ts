import { HydraCollection } from '../models/hydra.model';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  itemsPerPage: number;
  lastPage: number;
}

export function mapHydraCollection<T>(
  response: any,
  currentPage: number,
  itemsPerPage: number
): PaginatedResult<T> {

  const items = response.member ?? [];
  const total = response.totalItems ?? items.length;
  const lastPage = Math.max(1, Math.ceil(total / itemsPerPage));

  console.log(items);

  return {
    items,
    total,
    page: currentPage,
    itemsPerPage,
    lastPage,
  };
}
