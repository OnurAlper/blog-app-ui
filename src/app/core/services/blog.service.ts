// services/blog.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { BaseResponse, ListResponse } from '../models/base-response.model';

import {
  GetBlogPostDto,
  CreateBlogPostDto,
  UpdateBlogPostDto
} from '../models/blog.model';

import {
  CreateResponseDto,
  UpdateResponseDto,
  DeleteResponseDto
} from '../models/general.model';

export type OrderDirection = 'asc' | 'desc';

export interface BlogPostQuery {
  pageNumber?: number;
  pageSize?: number;
  orderBy?: string;
  orderDirection?: OrderDirection;
  searchTerm?: string | null;
}

@Injectable({ providedIn: 'root' })
export class BlogService extends BaseApiService {
  private readonly resource = 'BlogPost';

  getAll(query: BlogPostQuery = {}): Observable<ListResponse<GetBlogPostDto>> {
    return this.get<ListResponse<GetBlogPostDto>>(this.resource, {
      params: {
        pageNumber: query.pageNumber ?? 1,
        pageSize: query.pageSize ?? 10,
        orderBy: query.orderBy ?? 'CreatedAt',
        orderDirection: query.orderDirection ?? 'desc',
        searchTerm: query.searchTerm ?? undefined
      }
    });
  }

  getById(id: number): Observable<BaseResponse<GetBlogPostDto>> {
    return this.get<BaseResponse<GetBlogPostDto>>(`${this.resource}/${id}`);
  }

  create(input: CreateBlogPostDto): Observable<BaseResponse<CreateResponseDto>> {
    const formData = new FormData();
  
    // 📌 Text alanları ekle
    formData.append('title', input.title);
    formData.append('content', input.content);
    if (input.categoryId != null) {
      formData.append('categoryId', input.categoryId.toString());
    }
  
    // 📌 Dosya ekle
    if (input.coverImage instanceof File) {
      formData.append('coverImage', input.coverImage, input.coverImage.name);
    }
  
    return this.post<BaseResponse<CreateResponseDto>>(this.resource, formData);
  }
  

  update(input: UpdateBlogPostDto): Observable<BaseResponse<UpdateResponseDto>> {
    // Eğer BE endpoint'iniz PUT BlogPost/{id} ise şu satırı kullanın:
    // return this.put<BaseResponse<UpdateResponseDto>>(`${this.resource}/${input.id}`, input);
    return this.put<BaseResponse<UpdateResponseDto>>(this.resource, input);
  }

  /** İSİM DEĞİŞTİ: Base'in delete<T>(url) metoduyla çakışmamak için */
  remove(id: number): Observable<BaseResponse<DeleteResponseDto>> {
    return super.delete<BaseResponse<DeleteResponseDto>>(`${this.resource}/${id}`);
  }
}
