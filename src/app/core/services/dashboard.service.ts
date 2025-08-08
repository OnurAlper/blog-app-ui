import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { BaseResponse } from '../models/base-response.model';
import { DashboardData } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService extends BaseApiService {
  private readonly resource = 'Dashboard';

  getDashboardData(): Observable<BaseResponse<DashboardData>> {
    return this.get<BaseResponse<DashboardData>>(`${this.resource}/GetDashboardData`);
  }
}
