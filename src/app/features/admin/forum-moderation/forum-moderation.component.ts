import { Component, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ForumService } from 'src/app/core/services/forum.service';
import { NotificationService } from 'src/app/shared/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ForumCategory, ForumThread, ForumPost, ForumBan } from 'src/app/core/models/forum.model';
import { Router } from '@angular/router';

type Tab = 'flagged-threads' | 'flagged-posts' | 'bans' | 'categories';

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
  categories: ForumCategory[] = [];

  loading = false;

  // Ban formu
  banSearch = '';
  banSuggestions: { id: number; username: string; fullName: string }[] = [];
  selectedBanUser: { id: number; username: string; fullName: string } | null = null;
  banSuggestionsOpen = false;
  banReason = '';
  banExpiresAt = '';
  banSubmitting = false;

  private banSearch$ = new Subject<string>();

  // Kategori formu
  newCatName = '';
  newCatDesc = '';
  newCatOrder = 0;
  catSubmitting = false;
  editingCat: ForumCategory | null = null;

  constructor(
    private forumService: ForumService,
    private notify: NotificationService,
    public i18n: TranslateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTab();
    this.banSearch$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => q.length >= 2 ? this.forumService.searchBanUsers(q) : [])
    ).subscribe({
      next: (r: any) => {
        this.banSuggestions = (r?.data as any) || [];
        this.banSuggestionsOpen = this.banSuggestions.length > 0;
      }
    });
  }

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
    } else if (this.activeTab === 'categories') {
      this.forumService.getCategories()
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({ next: (r) => { this.categories = (r?.data as any) || []; }, error: this.onErr() });
    } else {
      this.forumService.getBans()
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({ next: (r) => { this.bans = (r?.data as any) || []; }, error: this.onErr() });
    }
  }

  // ── Kategori CRUD ─────────────────────────────────────────
  startEditCat(cat: ForumCategory): void {
    this.editingCat = { ...cat };
  }

  cancelEditCat(): void {
    this.editingCat = null;
  }

  saveEditCat(): void {
    if (!this.editingCat || !this.editingCat.name.trim()) return;
    this.catSubmitting = true;
    this.forumService.updateCategory({
      id: this.editingCat.id,
      name: this.editingCat.name,
      description: this.editingCat.description,
      isActive: this.editingCat.isActive,
      orderIndex: this.editingCat.orderIndex
    }).pipe(finalize(() => (this.catSubmitting = false)))
      .subscribe({
        next: () => { this.notify.success(this.i18n.instant('COMMON.UPDATE_SUCCESS')); this.editingCat = null; this.loadTab(); },
        error: this.onErr()
      });
  }

  createCategory(): void {
    if (!this.newCatName.trim() || this.catSubmitting) return;
    this.catSubmitting = true;
    this.forumService.createCategory({ name: this.newCatName, description: this.newCatDesc || undefined, orderIndex: this.newCatOrder })
      .pipe(finalize(() => (this.catSubmitting = false)))
      .subscribe({
        next: () => {
          this.notify.success(this.i18n.instant('COMMON.CREATE_SUCCESS'));
          this.newCatName = ''; this.newCatDesc = ''; this.newCatOrder = 0;
          this.loadTab();
        },
        error: this.onErr()
      });
  }

  deleteCat(id: number): void {
    if (!confirm(this.i18n.instant('COMMON.CONFIRM_DELETE'))) return;
    this.forumService.deleteCategory(id).subscribe({
      next: () => { this.notify.success(this.i18n.instant('COMMON.DELETE_SUCCESS')); this.loadTab(); },
      error: this.onErr()
    });
  }

  toggleCatActive(cat: ForumCategory): void {
    this.forumService.updateCategory({ id: cat.id, name: cat.name, description: cat.description, isActive: !cat.isActive, orderIndex: cat.orderIndex })
      .subscribe({
        next: () => { this.notify.success(this.i18n.instant('COMMON.UPDATE_SUCCESS')); this.loadTab(); },
        error: this.onErr()
      });
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

  onBanSearchInput(val: string): void {
    this.banSearch = val;
    this.selectedBanUser = null;
    this.banSearch$.next(val);
    if (!val) { this.banSuggestions = []; this.banSuggestionsOpen = false; }
  }

  selectBanUser(user: { id: number; username: string; fullName: string }): void {
    this.selectedBanUser = user;
    this.banSearch = `${user.username} — ${user.fullName}`;
    this.banSuggestions = [];
    this.banSuggestionsOpen = false;
  }

  quickBan(userId: number, userFullName: string): void {
    this.setTab('bans');
    // Pre-fill with known user — we don't have username so search by fullName
    this.banSuggestions = [{ id: userId, username: '', fullName: userFullName }];
    this.selectedBanUser = { id: userId, username: '', fullName: userFullName };
    this.banSearch = userFullName;
    this.banSuggestionsOpen = false;
  }

  submitBan(): void {
    if (!this.selectedBanUser || !this.banReason.trim() || this.banSubmitting) return;
    this.banSubmitting = true;
    this.forumService.banUser({ userId: this.selectedBanUser.id, reason: this.banReason, expiresAt: this.banExpiresAt || undefined })
      .pipe(finalize(() => (this.banSubmitting = false)))
      .subscribe({
        next: () => {
          this.notify.success('Kullanıcı banlandı.');
          this.selectedBanUser = null; this.banSearch = ''; this.banReason = ''; this.banExpiresAt = '';
          this.loadTab();
        },
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
