import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { BaseResponse } from '../models/base-response.model';

@Injectable({ providedIn: 'root' })
export class PostLikeService extends BaseApiService {

  likePost(postId: number): Observable<BaseResponse<any>> {
    return this.post<BaseResponse<any>>('postlike', { postId });
  }

  unlikePost(postId: number): Observable<BaseResponse<any>> {
    return this.delete<BaseResponse<any>>(`postlike/${postId}`);
  }
}
