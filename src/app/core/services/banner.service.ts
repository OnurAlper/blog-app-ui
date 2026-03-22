import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { BaseResponse } from '../models/base-response.model';
import { Banner, CreateBannerDto, UpdateBannerDto } from '../models/banner.model';

@Injectable({ providedIn: 'root' })
export class BannerService extends BaseApiService {

  getActive(): Observable<BaseResponse<Banner[]>> {
    return this.get<BaseResponse<Banner[]>>('Banner');
  }

  getAll(): Observable<BaseResponse<Banner[]>> {
    return this.get<BaseResponse<Banner[]>>('Banner/all');
  }

  create(dto: CreateBannerDto): Observable<any> {
    return this.post<any>('Banner', dto);
  }

  update(dto: UpdateBannerDto): Observable<any> {
    return this.put<any>('Banner', dto);
  }

  deleteBanner(id: number): Observable<any> {
    return this.delete<any>(`Banner/${id}`);
  }
}
