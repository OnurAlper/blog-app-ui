import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { ListResponse } from '../models/base-response.model';
import { GetCategoryDto } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService extends BaseApiService {
  private readonly resource = 'Categories';

  /**
   * Kategori listesini getirir.
   * @param searchTerm Opsiyonel arama kelimesi
   * @param orderBy Sıralama alanı (varsayılan "Name")
   * @param orderDirection Sıralama yönü ("asc" | "desc")
   */
  getCategories(
    searchTerm?: string,
    orderBy: string = 'Name',
    orderDirection: 'asc' | 'desc' = 'asc'
  ): Observable<ListResponse<GetCategoryDto>> {
    return this.get<ListResponse<GetCategoryDto>>(`${this.resource}/GetCategories`, {
      params: {
        searchTerm: searchTerm ?? '',
        orderBy,
        orderDirection
      }
    });
  }
}
