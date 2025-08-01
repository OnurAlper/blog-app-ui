import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BlogService, BlogPostQuery, OrderDirection } from 'src/app/core/services/blog.service';
import { GetBlogPostDto } from 'src/app/core/models/blog.model';
import { BaseResponse, ListResponse } from 'src/app/core/models/base-response.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

type BlogPostUI = GetBlogPostDto & { _imgErr?: boolean };

@Component({
  selector: 'app-blog-view',
  templateUrl: './blog-view.component.html',
  styleUrls: ['./blog-view.component.scss'],
  standalone: false
})
export class BlogViewComponent implements OnInit {
  // Liste
  items: BlogPostUI[] = [];
  loading = false;

  // Sıralama / filtreleme / sayfalama
  pageNumber = 1;
  pageSize = 10;
  orderBy: string = 'CreatedAt';
  orderDirection: OrderDirection = 'desc';
  searchTerm: string = '';

  // BE "totalPage" alanı aslında total COUNT
  totalCount = 0;
  // FE hesapladığımız gerçek sayfa sayısı
  totalPages = 0;

  // (İstersen numaralı sayfa düğmeleri için)
  pages: number[] = [];

  constructor(
    private readonly blogService: BlogService,
    private readonly snack: MatSnackBar,
    private readonly i18n: TranslateService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  /** 1–10 of 4861 şeklindeki metin için aralık hesapları */
  get rangeStart(): number {
    if (this.totalCount === 0) return 0;
    return (this.pageNumber - 1) * this.pageSize + 1;
  }
  get rangeEnd(): number {
    const end = this.pageNumber * this.pageSize;
    return Math.min(end, this.totalCount);
  }

  /** Listeyi yükler */
  load(): void {
    const query: BlogPostQuery = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      orderBy: this.orderBy,
      orderDirection: this.orderDirection,
      searchTerm: this.searchTerm?.trim() || undefined
    };

    this.loading = true;
    this.blogService.getAll(query)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: ListResponse<GetBlogPostDto>) => {
          // Eski _imgErr durumunu koru
          const oldById = new Map(this.items.map(i => [i.id, i]));
          this.items = (res.data || []).map(d => {
            const prev = oldById.get(d.id);
            return { ...d, _imgErr: prev?._imgErr };
          });

          // BE.res.totalPage === totalCount (misnamed)
          this.totalCount = res.totalPage ?? 0;
          this.totalPages = Math.max(1, Math.ceil(this.totalCount / this.pageSize));
          this.buildPages();
        },
        error: (err) => {
          const msg = err?.error?.message || this.i18n.instant('COMMON.ERROR') || 'An error occurred.';
          this.snack.open(msg, this.i18n.instant('COMMON.OK') || 'OK', { duration: 3000 });
        }
      });
  }

  /** Kapak görseli hatası */
  onImgError(post: BlogPostUI): void {
    post._imgErr = true;
  }

  /** Arama/filtre */
  onSearch(): void { this.pageNumber = 1; this.load(); }
  onFilterChange(): void { this.pageNumber = 1; this.load(); }
  onPageSizeChange(): void { this.pageNumber = 1; this.load(); }

  /** Başlık tıklayınca sıralama */
  toggleSort(field: string): void {
    if (this.orderBy === field) {
      this.orderDirection = this.orderDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.orderBy = field;
      this.orderDirection = 'asc';
    }
    this.pageNumber = 1;
    this.load();
  }

  /** (Opsiyonel) numaralı sayfalar için dizi */
  private buildPages(): void {
    const total = this.totalPages || 0;
    const current = this.pageNumber;
    const windowSize = 7;

    if (!total) { this.pages = []; return; }

    let start = Math.max(1, current - Math.floor(windowSize / 2));
    let end = Math.min(total, start + windowSize - 1);
    if (end - start + 1 < windowSize) {
      start = Math.max(1, end - windowSize + 1);
    }
    this.pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  /** Paginator okları */
  setPage(p: number): void { if (p !== this.pageNumber) { this.pageNumber = p; this.load(); } }
  goFirst(): void { if (this.pageNumber > 1) { this.pageNumber = 1; this.load(); } }
  goLast(): void { if (this.pageNumber < this.totalPages) { this.pageNumber = this.totalPages; this.load(); } }
  goPrev(): void { if (this.pageNumber > 1) { this.pageNumber--; this.load(); } }
  goNext(): void { if (this.pageNumber < this.totalPages) { this.pageNumber++; this.load(); } }

  refresh(): void { this.load(); }

  /** Aksiyonlar */
  open(post: BlogPostUI): void {
    this.snack.open(this.i18n.instant('COMMON.OPEN') + ` #${post.id}`, undefined, { duration: 1200 });
  }
  edit(post: BlogPostUI): void {
    this.snack.open(this.i18n.instant('COMMON.EDIT') + ` #${post.id}`, undefined, { duration: 1200 });
  }
  remove(id: number): void {
    const ok = confirm(this.i18n.instant('COMMON.DELETE') + ` #${id}?`);
    if (!ok) return;

    this.loading = true;
    this.blogService.remove(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: BaseResponse<any>) => {
          const msg = res?.message || this.i18n.instant('COMMON.DELETE') + ' OK';
          this.snack.open(msg, this.i18n.instant('COMMON.OK') || 'OK', { duration: 2000 });
          this.load();
        },
        error: (err) => {
          const msg = err?.error?.message || this.i18n.instant('COMMON.ERROR') || 'An error occurred.';
          this.snack.open(msg, this.i18n.instant('COMMON.OK') || 'OK', { duration: 3000 });
        }
      });
  }
}
