import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { BaseResponse } from '../models/base-response.model';
import { ForumCategory, ForumThread, ForumThreadDetail, ForumPost, ForumBan } from '../models/forum.model';

@Injectable({ providedIn: 'root' })
export class ForumService extends BaseApiService {

  // ── Categories ────────────────────────────────────────
  getCategories(): Observable<BaseResponse<ForumCategory[]>> {
    return this.get<BaseResponse<ForumCategory[]>>('ForumCategory');
  }

  createCategory(dto: { name: string; description?: string; orderIndex: number }): Observable<any> {
    return this.post<any>('ForumCategory', dto);
  }

  updateCategory(dto: { id: number; name: string; description?: string; isActive: boolean; orderIndex: number }): Observable<any> {
    return this.put<any>('ForumCategory', dto);
  }

  deleteCategory(id: number): Observable<any> {
    return this.delete<any>(`ForumCategory/${id}`);
  }

  // ── Threads ───────────────────────────────────────────
  getThreads(categoryId: number, page = 1, pageSize = 20, search?: string, orderBy = 'CreatedAt', direction = 'desc'): Observable<BaseResponse<ForumThread[]>> {
    return this.get<BaseResponse<ForumThread[]>>('ForumThread', {
      params: { categoryId, pageNumber: page, pageSize, search: search ?? '', orderBy, direction }
    });
  }

  getThread(id: number): Observable<BaseResponse<ForumThreadDetail>> {
    return this.get<BaseResponse<ForumThreadDetail>>(`ForumThread/${id}`);
  }

  createThread(dto: { title: string; content: string; categoryId: number }): Observable<any> {
    return this.post<any>('ForumThread', dto);
  }

  updateThread(dto: { id: number; title: string; content: string }): Observable<any> {
    return this.put<any>('ForumThread', dto);
  }

  deleteThread(id: number): Observable<any> {
    return this.delete<any>(`ForumThread/${id}`);
  }

  // ── Posts ─────────────────────────────────────────────
  getPosts(threadId: number, page = 1, pageSize = 30): Observable<BaseResponse<ForumPost[]>> {
    return this.get<BaseResponse<ForumPost[]>>('ForumPost', {
      params: { threadId, pageNumber: page, pageSize }
    });
  }

  createPost(dto: { content: string; threadId: number }): Observable<any> {
    return this.post<any>('ForumPost', dto);
  }

  updatePost(dto: { id: number; content: string }): Observable<any> {
    return this.put<any>('ForumPost', dto);
  }

  deletePost(id: number): Observable<any> {
    return this.delete<any>(`ForumPost/${id}`);
  }

  // ── Moderation ────────────────────────────────────────
  getFlaggedThreads(): Observable<BaseResponse<ForumThread[]>> {
    return this.get<BaseResponse<ForumThread[]>>('ForumModeration/flagged-threads');
  }

  getFlaggedPosts(): Observable<BaseResponse<ForumPost[]>> {
    return this.get<BaseResponse<ForumPost[]>>('ForumModeration/flagged-posts');
  }

  lockThread(threadId: number): Observable<any> {
    return this.post<any>(`ForumModeration/lock-thread/${threadId}`, {});
  }

  unlockThread(threadId: number): Observable<any> {
    return this.post<any>(`ForumModeration/unlock-thread/${threadId}`, {});
  }

  pinThread(threadId: number): Observable<any> {
    return this.post<any>(`ForumModeration/pin-thread/${threadId}`, {});
  }

  unpinThread(threadId: number): Observable<any> {
    return this.post<any>(`ForumModeration/unpin-thread/${threadId}`, {});
  }

  adminDeleteThread(threadId: number): Observable<any> {
    return this.delete<any>(`ForumModeration/thread/${threadId}`);
  }

  adminDeletePost(postId: number): Observable<any> {
    return this.delete<any>(`ForumModeration/post/${postId}`);
  }

  clearFlag(type: 'thread' | 'post', id: number): Observable<any> {
    return this.post<any>(`ForumModeration/clear-flag?type=${type}&id=${id}`, {});
  }

  getBans(): Observable<BaseResponse<ForumBan[]>> {
    return this.get<BaseResponse<ForumBan[]>>('ForumModeration/bans');
  }

  banUser(dto: { userId: number; reason: string; expiresAt?: string }): Observable<any> {
    return this.post<any>('ForumModeration/ban', dto);
  }

  unbanUser(banId: number): Observable<any> {
    return this.post<any>(`ForumModeration/unban/${banId}`, {});
  }
}
