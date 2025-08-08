import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs/operators';
import { BlogService, BlogPostQuery, OrderDirection } from 'src/app/core/services/blog.service';
import { GetBlogPostDto } from 'src/app/core/models/blog.model';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/shared/notification.service';
import { Router } from '@angular/router';

type BlogPostUI = GetBlogPostDto & { _imgErr?: boolean };

@Component({
  selector: 'app-blog-view',
  templateUrl: './blog-view.component.html',
  styleUrls: ['./blog-view.component.scss'],
  standalone: false
})
export class BlogViewComponent implements OnInit {
displayedColumns: string[] = [
  'title',
  'tags',
  'createdAt',
  'authorFullName',
  'categoryName',
  'stats', 
  'status',
  'actions'
];

  
  dataSource = new MatTableDataSource<BlogPostUI>([]);
  viewMode: 'table' | 'card' = 'table';
  loading = false;

  searchTerm = '';
  orderBy: string = 'CreatedAt';
  orderDirection: OrderDirection = 'desc';

  pageSize = 10;
  totalCount = 0;

  private searchDebounce!: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly blogService: BlogService,
    public readonly i18n: TranslateService,
    private readonly notify: NotificationService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const query: BlogPostQuery = {
      pageNumber: this.paginator ? this.paginator.pageIndex + 1 : 1,
      pageSize: this.pageSize,
      orderBy: this.orderBy,
      orderDirection: this.orderDirection,
      searchTerm: this.searchTerm.trim() || undefined
    };

    this.loading = true;
    this.blogService.getAll(query)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(res => {
        this.dataSource.data = (res.data || []).map(d => ({ ...d, _imgErr: false }));
        this.totalCount = res.totalPage ?? 0;
      });
  }

  onSearchInput(value: string): void {
    this.searchTerm = value;
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      if (this.paginator) this.paginator.firstPage();
      this.load();
    }, 300);
  }

  onSearch(): void {
    if (this.paginator) this.paginator.firstPage();
    this.load();
  }

  onSortChange(sort: Sort): void {
    const fieldMap: Record<string, string> = {
      title: 'Title',
      createdAt: 'CreatedAt',
      authorFullName: 'Author.Name',
      categoryName: 'Category.Name',
      tags: 'Tags',
      commentCount: 'CommentCount',
      likeCount: 'LikeCount',
      viewCount: 'ViewCount',
      estimatedReadMinutes: 'EstimatedReadMinutes',
      status: 'IsPublished'
    };

    const selectedField = fieldMap[sort.active] || sort.active.charAt(0).toUpperCase() + sort.active.slice(1);

    if (this.orderBy === selectedField) {
      this.orderDirection = this.orderDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.orderBy = selectedField;
      this.orderDirection = 'asc';
    }

    this.load();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.load();
  }

  onImgError(post: BlogPostUI): void {
    post._imgErr = true;
  }

  goToCreate(): void {
    this.router.navigate(['/blog/blog-create']);
  }


edit(post: BlogPostUI): void {
  this.router.navigate(['/blog/blog-edit', post.id]);
}


  remove(id: number): void {
    if (!confirm(`${this.i18n.instant('COMMON.DELETE')} #${id}?`)) return;
    this.loading = true;
    this.blogService.remove(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(() => {
        this.notify.success(this.i18n.instant('COMMON.DELETE') + ' OK');
        this.load();
      });
  }
}
