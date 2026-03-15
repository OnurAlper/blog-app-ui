import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { BaseResponse, PagedResponse } from '../models/base-response.model';
import { GetNotificationDto } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationApiService extends BaseApiService {

  getAll(pageNumber = 1, pageSize = 20): Observable<PagedResponse<GetNotificationDto>> {
    return this.get<PagedResponse<GetNotificationDto>>('notification', {
      params: { pageNumber, pageSize, orderBy: 'CreatedAt', orderDirection: 'desc' }
    });
  }

  markAsRead(id: number): Observable<BaseResponse<any>> {
    return this.put<BaseResponse<any>>(`notification/${id}/read`, {});
  }

  removeNotification(id: number): Observable<BaseResponse<any>> {
    return this.delete<BaseResponse<any>>(`notification/${id}`);
  }
}
