import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { ListResponse } from '../models/base-response.model';
import { GetCommentDto, CreateCommentDto, UpdateCommentDto } from '../models/comment.model';
import { CreateResponseDto, UpdateResponseDto, DeleteResponseDto } from '../models/general.model';

@Injectable({ providedIn: 'root' })
export class CommentService extends BaseApiService {
  private readonly resource = 'Comment';

  /**
   * Tüm yorumları getirir (sayfalama + filtreleme).
   */
  getAllComments(
    pageNumber: number = 1,
    pageSize: number = 10,
    orderBy: string = 'CreatedAt',
    orderDirection: 'asc' | 'desc' = 'desc',
    searchTerm?: string
  ): Observable<ListResponse<GetCommentDto>> {
    return this.get<ListResponse<GetCommentDto>>(`${this.resource}`, {
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
   * Id'ye göre tek yorum getirir.
   */
  getCommentById(id: number): Observable<GetCommentDto> {
    return this.get<any>(`${this.resource}/${id}`).pipe(
      map((res: any) => res.data || res)
    );
  }

  /**
   * Yeni yorum oluşturur.
   */
  createComment(dto: CreateCommentDto): Observable<CreateResponseDto> {
    return this.post<CreateResponseDto>(`${this.resource}`, dto);
  }

  /**
   * Yorum günceller.
   */
  updateComment(dto: UpdateCommentDto): Observable<UpdateResponseDto> {
    return this.put<UpdateResponseDto>(`${this.resource}`, dto);
  }

  /**
   * Yorum siler.
   */
  deleteComment(id: number): Observable<DeleteResponseDto> {
    return this.delete<DeleteResponseDto>(`${this.resource}/${id}`);
  }
}