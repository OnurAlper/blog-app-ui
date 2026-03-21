import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ForumService } from 'src/app/core/services/forum.service';
import { NotificationService } from 'src/app/shared/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ForumThread, ForumPost, ForumBan } from 'src/app/core/models/forum.model';
import { Router } from '@angular/router';

type Tab = 'flagged-threads' | 'flagged-posts' | 'bans';

@Component({
  selector: 'app-forum-moderation',
  standalone: false,
  templateUrl: './forum-moderation.component.html',
  styleUrls: ['./forum-moderation.component.scss']
})
export class ForumModerationComponent implements OnInit {
  activeTab: Tab = 'flagged-threads';

  flaggedThreads: ForumThread[] = [];
  flaggedPosts: ForumPost[] = [];
  bans: ForumBan[] = [];

  loading = false;

  // Ban formu
  banUserId: number | null = null;
  banReason = '';
  banExpiresAt = '';
  banSubmitting = false;

  constructor(
    private forumService: ForumService,
    private notify: NotificationService,
    public i18n: TranslateService,
    private router: Router
  ) {}

  ngOnInit(): void { this.loadTab(); }

  setTab(tab: Tab): void { this.activeTab = tab; this.loadTab(); }

  loadTab(): void {
    this.loading = true;
    if (this.activeTab === 'flagged-threads') {
      this.forumService.getFlaggedThreads()
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({ next: (r) => { this.flaggedThreads = (r?.data as any) || []; }, error: this.onErr() });
    } else if (this.activeTab === 'flagged-posts') {
      this.forumService.getFlaggedPosts()
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({ next: (r) => { this.flaggedPosts = (r?.data as any) || []; }, error: this.onErr() });
    } else {
      this.forumService.getBans()
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({ next: (r) => { this.bans = (r?.data as any) || []; }, error: this.onErr() });
    }
  }

  lockThread(id: number): void {
    this.forumService.lockThread(id).subscribe({ next: () => { this.notify.success('Thread kilitlendi.'); this.loadTab(); }, error: this.onErr() });
  }

  unlockThread(id: number): void {
    this.forumService.unlockThread(id).subscribe({ next: () => { this.notify.success('Thread kilidi açıldı.'); this.loadTab(); }, error: this.onErr() });
  }

  pinThread(id: number): void {
    this.forumService.pinThread(id).subscribe({ next: () => { this.notify.success('Thread sabitlendi.'); this.loadTab(); }, error: this.onErr() });
  }

  deleteThread(id: number): void {
    if (!confirm(this.i18n.instant('COMMON.CONFIRM_DELETE'))) return;
    this.forumService.adminDeleteThread(id).subscribe({ next: () => { this.notify.success('Thread silindi.'); this.loadTab(); }, error: this.onErr() });
  }

  clearThreadFlag(id: number): void {
    this.forumService.clearFlag('thread', id).subscribe({ next: () => { this.notify.success('Flag temizlendi.'); this.loadTab(); }, error: this.onErr() });
  }

  deletePost(id: number): void {
    if (!confirm(this.i18n.instant('COMMON.CONFIRM_DELETE'))) return;
    this.forumService.adminDeletePost(id).subscribe({ next: () => { this.notify.success('Gönderi silindi.'); this.loadTab(); }, error: this.onErr() });
  }

  clearPostFlag(id: number): void {
    this.forumService.clearFlag('post', id).subscribe({ next: () => { this.notify.success('Flag temizlendi.'); this.loadTab(); }, error: this.onErr() });
  }

  submitBan(): void {
    if (!this.banUserId || !this.banReason.trim() || this.banSubmitting) return;
    this.banSubmitting = true;
    this.forumService.banUser({ userId: this.banUserId, reason: this.banReason, expiresAt: this.banExpiresAt || undefined })
      .pipe(finalize(() => (this.banSubmitting = false)))
      .subscribe({
        next: () => { this.notify.success('Kullanıcı banlandı.'); this.banUserId = null; this.banReason = ''; this.banExpiresAt = ''; this.loadTab(); },
        error: this.onErr()
      });
  }

  unban(banId: number): void {
    this.forumService.unbanUser(banId).subscribe({ next: () => { this.notify.success('Ban kaldırıldı.'); this.loadTab(); }, error: this.onErr() });
  }

  viewThread(threadId: number): void { this.router.navigate(['/forum/thread', threadId]); }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  private onErr() { return (err: any) => this.notify.error(err?.error?.Message || this.i18n.instant('COMMON.ERROR')); }
}
