import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BlogService, BlogPostQuery, OrderDirection } from 'src/app/core/services/blog.service';
import { GetBlogPostDto } from 'src/app/core/models/blog.model';
import { BaseResponse, ListResponse } from 'src/app/core/models/base-response.model';
import { TranslateService } from '@ngx-translate/core';
import { PageableService } from 'src/app/core/services/pageable.service';
import { NotificationService } from 'src/app/shared/notification.service'; // ✅ Notification Service

type BlogPostUI = GetBlogPostDto & { _imgErr?: boolean };

@Component({
  selector: 'app-blog-view',
  templateUrl: './blog-view.component.html',
  styleUrls: ['./blog-view.component.scss'],
  standalone: false
})
export class BlogViewComponent implements OnInit {
  items: BlogPostUI[] = [];
  loading = false;

  orderBy: string = 'CreatedAt';
  orderDirection: OrderDirection = 'desc';
  searchTerm: string = '';

  constructor(
    private readonly blogService: BlogService,
    public readonly i18n: TranslateService,
    public readonly pageable: PageableService,
    private readonly notify: NotificationService // ✅ buradan snackbar
  ) {}

  ngOnInit(): void {
    this.load();
  }

  /** Listeyi yükler */
  load(): void {
    const query: BlogPostQuery = {
      pageNumber: this.pageable.pageNumber,
      pageSize: this.pageable.pageSize,
      orderBy: this.orderBy,
      orderDirection: this.orderDirection,
      searchTerm: this.searchTerm?.trim() || undefined
    };

    this.loading = true;
    this.blogService.getAll(query)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: ListResponse<GetBlogPostDto>) => {
          const oldById = new Map(this.items.map(i => [i.id, i]));
          this.items = (res.data || []).map(d => {
            const prev = oldById.get(d.id);
            return { ...d, _imgErr: prev?._imgErr };
          });

          this.pageable.updateTotal(res.totalPage ?? 0);
        },
        error: (err) => {
          this.notify.error(err?.error?.message || this.i18n.instant('COMMON.ERROR'));
        }
      });
  }

  /** Kapak görseli hatası */
  onImgError(post: BlogPostUI): void {
    post._imgErr = true;
  }

  /** Arama / filtreleme */
  onSearch(): void {
    this.pageable.goFirst();
    this.load();
  }

  onFilterChange(): void {
    this.pageable.goFirst();
    this.load();
  }

  onPageSizeChange(): void {
    this.pageable.goFirst();
    this.load();
  }

  /** Sıralama */
  toggleSort(field: string): void {
    if (this.orderBy === field) {
      this.orderDirection = this.orderDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.orderBy = field;
      this.orderDirection = 'asc';
    }
    this.pageable.goFirst();
    this.load();
  }

  /** Aksiyonlar */
  open(post: BlogPostUI): void {
    this.notify.info(this.i18n.instant('COMMON.OPEN') + ` #${post.id}`);
  }

  edit(post: BlogPostUI): void {
    this.notify.info(this.i18n.instant('COMMON.EDIT') + ` #${post.id}`);
  }

  remove(id: number): void {
    const ok = confirm(this.i18n.instant('COMMON.DELETE') + ` #${id}?`);
    if (!ok) return;

    this.loading = true;
    this.blogService.remove(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: BaseResponse<any>) => {
          this.notify.success(res?.message || this.i18n.instant('COMMON.DELETE') + ' OK');
          this.load();
        },
        error: (err) => {
          this.notify.error(err?.error?.message || this.i18n.instant('COMMON.ERROR'));
        }
      });
  }
}
