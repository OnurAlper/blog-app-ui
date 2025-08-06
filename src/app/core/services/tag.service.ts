import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { ListResponse } from '../models/base-response.model';
import { GetTagDto } from '../models/tag.model';

@Injectable({ providedIn: 'root' })
export class TagService extends BaseApiService {
  private readonly resource = 'Tag';

  /**
   * Tüm etiketleri getirir (sayfalama + filtreleme).
   * @param pageNumber Sayfa numarası
   * @param pageSize Sayfa boyutu
   * @param orderBy Sıralama alanı
   * @param orderDirection "asc" | "desc"
   * @param searchTerm Opsiyonel arama kelimesi
   */
  getAllTags(
    pageNumber: number = 1,
    pageSize: number = 2147483647,
    orderBy: string = 'Name',
    orderDirection: 'asc' | 'desc' = 'asc',
    searchTerm?: string
  ): Observable<ListResponse<GetTagDto>> {
    return this.get<ListResponse<GetTagDto>>(`${this.resource}`, {
      params: {
        pageNumber,
        pageSize,
        orderBy,
        orderDirection,
        searchTerm: searchTerm ?? ''
      }
    });
  }
}
