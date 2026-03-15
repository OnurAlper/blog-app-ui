import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { BaseResponse } from '../models/base-response.model';

@Injectable({ providedIn: 'root' })
export class BlogViewService extends BaseApiService {

  trackView(postId: number): Observable<BaseResponse<any>> {
    const ipAddress = undefined; // backend IP'yi de alabilir, optional
    return this.post<BaseResponse<any>>('blogview', { postId, ipAddress });
  }
}
