import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/shared/notification.service';
import { BlogService } from 'src/app/core/services/blog.service';
import { CategoryService } from 'src/app/core/services/category.service';
import { TagService } from 'src/app/core/services/tag.service';

// Modelden import et
import { GetBlogPostDto } from 'src/app/core/models/blog.model';
import { GetCategoryDto } from 'src/app/core/models/category.model';
import { GetTagDto } from 'src/app/core/models/tag.model';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.scss'],
  standalone: false
})
export class BlogListComponent implements OnInit {
  blogs: GetBlogPostDto[] = [];
  categories: GetCategoryDto[] = [];
  tags: GetTagDto[] = [];

  loading = false;
  loadingCategories = false;
  loadingTags = false;

  // Filters
  searchTerm = '';
  selectedCategoryId?: number;
  selectedTagId?: number;
  sortBy: string = 'CreatedAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Pagination
  pageIndex = 0;
  pageSize = 9; // 3x3 grid
  totalCount = 0;

  private searchDebounce: any;

  constructor(
    private readonly blogService: BlogService,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
    private readonly router: Router,
    private readonly notify: NotificationService,
    public readonly i18n: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadBlogs();
  }

  loadBlogs(): void {
  const pageNumber = this.pageIndex + 1;
  this.loading = true;

  this.blogService
    .getAll({  
      pageNumber: pageNumber,
      pageSize: this.pageSize,
      orderBy: this.sortBy,
      orderDirection: this.sortDirection,
      searchTerm: this.searchTerm.trim() || undefined
    })
    .pipe(finalize(() => (this.loading = false)))
    .subscribe({
      next: (res: any) => {
        this.blogs = (res.data || []) as GetBlogPostDto[];
        this.totalCount = res.totalPage ?? this.blogs.length;
        
        console.log('Blogs loaded:', this.blogs);
      },
      error: (err: any) => {
        const backendMsg = err?.error?.Message || err?.error?.message;
        this.notify.error(backendMsg || this.i18n.instant('COMMON.ERROR'));
        this.blogs = [];
      }
    });
}

  loadCategories(): void {
    this.loadingCategories = true;
    this.categoryService
      .getCategories()
      .pipe(finalize(() => (this.loadingCategories = false)))
      .subscribe({
        next: (res) => {
          this.categories = (res.data || []).map((x: any) => ({
            id: x.id ?? x.Id,
            name: x.name ?? x.Name
          })) as GetCategoryDto[];
        },
        error: () => {
          this.categories = [];
        }
      });
  }

  onSearchInput(value: string): void {
    this.searchTerm = value;
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.pageIndex = 0;
      this.loadBlogs();
    }, 500);
  }

  onCategoryChange(categoryId?: number): void {
    this.selectedCategoryId = categoryId;
    this.pageIndex = 0;
    // TODO: Backend'e category filtresi eklenecek
    this.loadBlogs();
  }

  onTagChange(tagId?: number): void {
    this.selectedTagId = tagId;
    this.pageIndex = 0;
    // TODO: Backend'e tag filtresi eklenecek
    this.loadBlogs();
  }

  onSortChange(sort: string): void {
    this.sortBy = sort;
    this.pageIndex = 0;
    this.loadBlogs();
  }

  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadBlogs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  viewBlog(blogId: number): void {
    this.router.navigate(['/client/blog', blogId]);
  }

  truncateContent(content: string, maxLength: number = 150): string {
    if (!content) return '';
    const strippedContent = content.replace(/<[^>]*>/g, '');
    return strippedContent.length > maxLength 
      ? strippedContent.substring(0, maxLength) + '...' 
      : strippedContent;
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getDefaultImage(): string {
    return 'assets/images/default-blog.jpg';
  }
}