import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { ListResponse } from '../models/base-response.model';
import { GetTagDto, CreateTagDto, UpdateTagDto } from '../models/tag.model';
import { CreateResponseDto, UpdateResponseDto, DeleteResponseDto } from '../models/general.model';

@Injectable({ providedIn: 'root' })
export class TagService extends BaseApiService {
  private readonly resource = 'Tag';

  /**
   * Tüm etiketleri getirir (sayfalama + filtreleme).
   */
  getAllTags(
    pageNumber: number = 1,
    pageSize: number = 50,
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

  /**
   * Id'ye göre tek etiket getirir.
   */
  getTagById(id: number): Observable<GetTagDto> {
    return this.get<GetTagDto>(`${this.resource}/${id}`);
  }

  /**
   * Yeni etiket oluşturur.
   */
  createTag(dto: CreateTagDto): Observable<CreateResponseDto> {
    return this.post<CreateResponseDto>(`${this.resource}`, dto);
  }

  /**
   * Etiket günceller.
   */
  updateTag(dto: UpdateTagDto): Observable<UpdateResponseDto> {
    return this.put<UpdateResponseDto>(`${this.resource}`, dto);
  }
  /**
   * Etiket siler.
   */
  deleteTag(id: number): Observable<DeleteResponseDto> {
    return this.delete<DeleteResponseDto>(`${this.resource}/${id}`);
  }
}
