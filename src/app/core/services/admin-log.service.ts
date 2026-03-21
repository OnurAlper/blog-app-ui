import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { BaseResponse } from '../models/base-response.model';
import { GetAdminActionLogDto } from '../models/admin-log.model';

@Injectable({ providedIn: 'root' })
export class AdminLogService extends BaseApiService {
  private readonly resource = 'AdminActionLog';

  getAll(search?: string, orderBy = 'Timestamp', direction = 'desc'): Observable<BaseResponse<GetAdminActionLogDto[]>> {
    return this.get<BaseResponse<GetAdminActionLogDto[]>>(this.resource, {
      params: { search: search ?? '', orderBy, direction }
    });
  }

  getById(id: number): Observable<BaseResponse<GetAdminActionLogDto>> {
    return this.get<BaseResponse<GetAdminActionLogDto>>(`${this.resource}/${id}`);
  }
}
