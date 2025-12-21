import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { mapHydraCollection, PaginatedResult } from '../utils/hydra';
import { HydraCollection } from '../models/hydra.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiPlatformService<T> {
  private baseUrl = environment.apiUrl;

  constructor(protected http: HttpClient) {}

  list(
    endpoint: string,
    page = 1,
    itemsPerPage = 10,
    filters: Record<string, any> = {}
  ): Observable<PaginatedResult<T>> {

    let params = new HttpParams()
      .set('page', page)
      .set('itemsPerPage', itemsPerPage);

    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value);
      }
    });

    return this.http.get<HydraCollection<T>>(`${this.baseUrl}/${endpoint}`, { params }).pipe(
      map(res => mapHydraCollection(res, page, itemsPerPage))
    );
  }

  get(endpoint: string, id: string | number): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}/${id}`);
  }

  create(endpoint: string, data: Partial<T>): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data);
  }

  update(endpoint: string, id: string | number, data: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}/${id}`, data);
  }

  patch(endpoint: string, id: string | number, data: Partial<T>): Observable<T> {
    return this.http.request<T>('PATCH', `${this.baseUrl}/${endpoint}/${id}`, { body: data });
  }

  delete(endpoint: string, id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${endpoint}/${id}`);
  }

  createFormData(endpoint: string, fd: FormData) {
    // do not set headers content-type; browser sets it
    return this.http.post<any>(`${this.baseUrl}/${endpoint}`, fd);
  }

  updateFormData(endpoint: string, id: string | number, fd: FormData) {
    return this.http.request<any>('PUT', `${this.baseUrl}/${endpoint}/${id}`, { body: fd });
  }
}