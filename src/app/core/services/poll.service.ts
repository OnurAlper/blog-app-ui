import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { BaseResponse } from '../models/base-response.model';
import { Poll, CreatePollDto, UpdatePollDto, VotePollDto, PollVoter } from '../models/poll.model';

@Injectable({ providedIn: 'root' })
export class PollService extends BaseApiService {

  getAll(): Observable<BaseResponse<Poll[]>> {
    return this.get<BaseResponse<Poll[]>>('Poll');
  }

  getById(id: number): Observable<BaseResponse<Poll>> {
    return this.get<BaseResponse<Poll>>(`Poll/${id}`);
  }

  create(dto: CreatePollDto): Observable<any> {
    return this.post<any>('Poll', dto);
  }

  update(dto: UpdatePollDto): Observable<any> {
    return this.put<any>('Poll', dto);
  }

  deletePoll(id: number): Observable<any> {
    return super.delete<any>(`Poll/${id}`);
  }

  vote(pollId: number, dto: VotePollDto): Observable<any> {
    return this.post<any>(`Poll/${pollId}/vote`, dto);
  }

  getVoters(pollId: number): Observable<BaseResponse<PollVoter[]>> {
    return this.get<BaseResponse<PollVoter[]>>(`Poll/${pollId}/voters`);
  }
}
