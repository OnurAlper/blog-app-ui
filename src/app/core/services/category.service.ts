import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // 👈 BUNU EKLE
import { BaseApiService } from './base-api.service';
import { ListResponse } from '../models/base-response.model';
import { GetCategoryDto, CreateCategoryDto, UpdateCategoryDto } from '../models/category.model';
import { CreateResponseDto, UpdateResponseDto, DeleteResponseDto } from '../models/general.model';

@Injectable({ providedIn: 'root' })
export class CategoryService extends BaseApiService {
  private readonly resource = 'Categories';

  /**
   * Tüm kategorileri getirir (sayfalama + filtreleme).
   */
  getAllCategories(
    pageNumber: number = 1,
    pageSize: number = 50,
    orderBy: string = 'Name',
    orderDirection: 'asc' | 'desc' = 'asc',
    searchTerm?: string
  ): Observable<ListResponse<GetCategoryDto>> {
    return this.get<ListResponse<GetCategoryDto>>(`${this.resource}/GetCategories`, {
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
   * Kategori listesini getirir (eski metod - geriye dönük uyumluluk).
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

  /**
   * Id'ye göre tek kategori getirir.
   */
  getCategoryById(id: number): Observable<GetCategoryDto> {
    return this.get<any>(`${this.resource}/GetById`, {
      params: { id }
    }).pipe(
      map((res: any) => res.data || res) // 👈 BUNU EKLE - Backend wrapped response döndürüyor
    );
  }

  /**
   * Yeni kategori oluşturur.
   */
  createCategory(dto: CreateCategoryDto): Observable<CreateResponseDto> {
    return this.post<CreateResponseDto>(`${this.resource}/Create`, dto);
  }

  /**
   * Kategori günceller.
   */
  updateCategory(dto: UpdateCategoryDto): Observable<UpdateResponseDto> {
    return this.put<UpdateResponseDto>(`${this.resource}/Update`, dto);
  }

  /**
   * Kategori siler.
   */
  deleteCategory(id: number): Observable<DeleteResponseDto> {
    return this.delete<DeleteResponseDto>(`${this.resource}/Delete?id=${id}`);
  }
}