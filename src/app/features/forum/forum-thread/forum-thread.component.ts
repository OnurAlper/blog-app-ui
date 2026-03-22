import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Subject, takeUntil } from 'rxjs';
import { ForumService } from 'src/app/core/services/forum.service';
import { NotificationService } from 'src/app/shared/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { ForumThreadDetail } from 'src/app/core/models/forum.model';

@Component({
  selector: 'app-forum-thread',
  standalone: false,
  templateUrl: './forum-thread.component.html',
  styleUrls: ['./forum-thread.component.scss']
})
export class ForumThreadComponent implements OnInit, OnDestroy {
  thread: ForumThreadDetail | null = null;
  loading = false;
  replyContent = '';
  replySubmitting = false;
  currentUserId: number | null = null;

  editingPostId: number | null = null;
  editContent = '';

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private forumService: ForumService,
    private notify: NotificationService,
    public i18n: TranslateService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.currentUserId = user?.id ?? null;

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(p => {
      this.loadThread(+p['id']);
    });
  }

  loadThread(id: number): void {
    this.loading = true;
    this.forumService.getThread(id)
      .pipe(finalize(() => (this.loading = false)), takeUntil(this.destroy$))
      .subscribe({
        next: (res) => { this.thread = (res?.data as any) || null; },
        error: (err) => this.notify.error(err?.error?.Message || this.i18n.instant('COMMON.ERROR'))
      });
  }

  submitReply(): void {
    if (!this.replyContent.trim() || !this.thread || this.replySubmitting) return;
    this.replySubmitting = true;
    this.forumService.createPost({ content: this.replyContent.trim(), threadId: this.thread.id })
      .pipe(finalize(() => (this.replySubmitting = false)), takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.replyContent = '';
          this.notify.success(this.i18n.instant('FORUM.REPLY_SENT'));
          this.loadThread(this.thread!.id);
        },
        error: (err) => this.notify.error(err?.error?.Message || this.i18n.instant('COMMON.ERROR'))
      });
  }

  startEdit(postId: number, content: string): void {
    this.editingPostId = postId;
    this.editContent = content;
  }

  cancelEdit(): void { this.editingPostId = null; this.editContent = ''; }

  saveEdit(postId: number): void {
    if (!this.editContent.trim()) return;
    this.forumService.updatePost({ id: postId, content: this.editContent.trim() })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.cancelEdit();
          this.notify.success(this.i18n.instant('FORUM.POST_UPDATED'));
          this.loadThread(this.thread!.id);
        },
        error: (err) => this.notify.error(err?.error?.Message || this.i18n.instant('COMMON.ERROR'))
      });
  }

  deletePost(postId: number): void {
    if (!confirm(this.i18n.instant('COMMON.CONFIRM_DELETE'))) return;
    this.forumService.deletePost(postId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.notify.success(this.i18n.instant('FORUM.POST_DELETED')); this.loadThread(this.thread!.id); },
        error: (err) => this.notify.error(err?.error?.Message || this.i18n.instant('COMMON.ERROR'))
      });
  }

  deleteThread(): void {
    if (!this.thread || !confirm(this.i18n.instant('COMMON.CONFIRM_DELETE'))) return;
    this.forumService.deleteThread(this.thread.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.notify.success(this.i18n.instant('FORUM.THREAD_DELETED')); this.router.navigate(['/forum/category', this.thread!.categoryId]); },
        error: (err) => this.notify.error(err?.error?.Message || this.i18n.instant('COMMON.ERROR'))
      });
  }

  reportPost(postId: number): void {
    if (!confirm(this.i18n.instant('FORUM.CONFIRM_REPORT'))) return;
    this.forumService.flagPost(postId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.notify.success(this.i18n.instant('FORUM.REPORT_SUCCESS')); this.loadThread(this.thread!.id); },
        error: (err) => this.notify.error(err?.error?.Message || this.i18n.instant('COMMON.ERROR'))
      });
  }

  reportThread(): void {
    if (!this.thread || !confirm(this.i18n.instant('FORUM.CONFIRM_REPORT'))) return;
    this.forumService.flagThread(this.thread.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.notify.success(this.i18n.instant('FORUM.REPORT_SUCCESS')); this.loadThread(this.thread!.id); },
        error: (err) => this.notify.error(err?.error?.Message || this.i18n.instant('COMMON.ERROR'))
      });
  }

  isOwner(userId: number): boolean { return this.currentUserId === userId; }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  goBack(): void { this.router.navigate(['/forum/category', this.thread?.categoryId]); }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
