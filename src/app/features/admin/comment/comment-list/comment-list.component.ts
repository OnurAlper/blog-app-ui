import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/shared/notification.service';
import { CommentService } from 'src/app/core/services/comment.service';
import { GetCommentDto } from 'src/app/core/models/comment.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.scss'],
  standalone: false
})
export class CommentListComponent implements OnInit {
  displayedColumns: string[] = ['content', 'postTitle', 'userFullName', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<GetCommentDto>([]);

  loading = false;

  searchTerm = '';
  orderBy: string = 'CreatedAt';
  orderDirection: 'asc' | 'desc' = 'desc';
  pageIndex = 0;
  pageSize = 10;
  totalCount = 0;
  postIdFilter?: number;

  private searchDebounce!: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly commentService: CommentService,
    public readonly i18n: TranslateService,
    private readonly notify: NotificationService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const pid = params['postId'];
      this.postIdFilter = pid ? Number(pid) : undefined;
      this.load();
    });
  }

  // Listeyi yükle
  load(): void {
    const pageNumber = this.pageIndex + 1;
    this.loading = true;

    this.commentService
      .getAllComments(pageNumber, this.pageSize, this.orderBy, this.orderDirection, this.searchTerm.trim() || undefined, this.postIdFilter)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          const items = (res.data || []).map((x: any) => ({
            id: x.id ?? x.Id,
            content: x.content ?? x.Content ?? '',
            createdAt: x.createdAt ?? x.CreatedAt,
            postId: x.postId ?? x.PostId,
            postTitle: x.postTitle ?? x.PostTitle ?? 'Bilinmeyen',
            userId: x.userId ?? x.UserId,
            userFullName: x.userFullName ?? x.UserFullName ?? 'Anonim'
          })) as GetCommentDto[];

          this.dataSource.data = items;
          this.totalCount = res.totalPage ?? items.length;
        },
        error: (err) => {
          const backendMsg = err?.error?.Message || err?.error?.message;
          this.notify.error(backendMsg || this.i18n.instant('COMMON.ERROR'));
          this.dataSource.data = [];
          this.totalCount = 0;
        }
      });
  }

  // Arama input
  onSearchInput(value: string): void {
    this.searchTerm = value;
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.pageIndex = 0;
      this.load();
    }, 300);
  }

  // Arama butonu
  onSearch(): void {
    this.pageIndex = 0;
    this.load();
  }

  // Sıralama
  onSortChange(sort: Sort): void {
    const fieldMap: Record<string, string> = { 
      content: 'Content',
      postTitle: 'PostTitle',
      userFullName: 'UserFullName',
      createdAt: 'CreatedAt'
    };
    const selectedField = fieldMap[sort.active] || sort.active;

    if (this.orderBy === selectedField) {
      this.orderDirection = this.orderDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.orderBy = selectedField;
      this.orderDirection = 'asc';
    }

    this.load();
  }

  clearPostFilter(): void {
    this.postIdFilter = undefined;
    this.router.navigate(['/comments']);
  }

  // Sayfa değişimi
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }

  // Reply state
  replyingTo: GetCommentDto | null = null;
  replyContent = '';
  replySubmitting = false;

  // Yanıtla butonuna tıklandı
  startReply(comment: GetCommentDto): void {
    this.replyingTo = comment;
    this.replyContent = '';
  }

  cancelReply(): void {
    this.replyingTo = null;
    this.replyContent = '';
  }

  submitReply(): void {
    if (!this.replyContent.trim() || !this.replyingTo || this.replySubmitting) return;
    this.replySubmitting = true;

    this.commentService.createComment({
      postId: this.replyingTo.postId,
      content: this.replyContent.trim(),
      parentId: this.replyingTo.id
    })
      .pipe(finalize(() => (this.replySubmitting = false)))
      .subscribe({
        next: () => {
          this.notify.success('Yanıt gönderildi.');
          this.replyingTo = null;
          this.replyContent = '';
          this.load();
        },
        error: (err: any) => {
          const msg = err?.error?.Message || err?.error?.message;
          this.notify.error(msg || 'Yanıt gönderilemedi.');
        }
      });
  }

  // Yoruma git (blog detay sayfası)
  viewPost(comment: GetCommentDto): void {
    this.router.navigate(['/client/blog', comment.postId]);
  }

  // Sil
  remove(id: number): void {
    if (!confirm(this.i18n.instant('COMMON.CONFIRM_DELETE'))) return;

    this.loading = true;
    this.commentService
      .deleteComment(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          const backendMsg = (res as any)?.Message || (res as any)?.message;
          this.notify.success(backendMsg || this.i18n.instant('COMMON.DELETE_SUCCESS'));

          // son sayfada tek eleman silindiyse bir önceki sayfaya dön
          if (this.dataSource.data.length === 1 && this.pageIndex > 0) {
            this.pageIndex -= 1;
          }
          this.load();
        },
        error: (err) => {
          const backendMsg = err?.error?.Message || err?.error?.message;
          this.notify.error(backendMsg || this.i18n.instant('COMMON.DELETE_FAILED'));
        }
      });
  }

  // Yorumu kısalt (preview için)
  truncateContent(content: string, maxLength: number = 100): string {
    if (!content) return '';
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...' 
      : content;
  }

  // Tarih formatı
  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}