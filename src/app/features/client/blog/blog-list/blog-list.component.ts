import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/shared/notification.service';
import { BlogService } from 'src/app/core/services/blog.service';
import { CategoryService } from 'src/app/core/services/category.service';
import { TagService } from 'src/app/core/services/tag.service';
import { SignalRService } from 'src/app/core/services/signalr.service';
import { PostLikeService } from 'src/app/core/services/post-like.service';
import { BlogViewService } from 'src/app/core/services/blog-view.service';

import { GetBlogPostDto } from 'src/app/core/models/blog.model';
import { GetCategoryDto } from 'src/app/core/models/category.model';
import { GetTagDto } from 'src/app/core/models/tag.model';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.scss'],
  standalone: false
})
export class BlogListComponent implements OnInit, OnDestroy {
  blogs: GetBlogPostDto[] = [];
  categories: GetCategoryDto[] = [];
  tags: GetTagDto[] = [];

  loading = false;
  loadingCategories = false;
  loadingTags = false;

  searchTerm = '';
  selectedCategoryId?: number;
  selectedTagId?: number;
  sortBy: string = 'CreatedAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  pageIndex = 0;
  pageSize = 9;
  totalCount = 0;

  // Liked post ID'lerini takip et
  likedPostIds = new Set<number>();
  likingPostIds = new Set<number>(); // istek devam ederken ikinci tıklamayı engeller

  private searchDebounce: any;
  private sub = new Subscription();

  constructor(
    private readonly blogService: BlogService,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
    private readonly router: Router,
    private readonly notify: NotificationService,
    private readonly signalR: SignalRService,
    private readonly postLikeService: PostLikeService,
    private readonly blogViewService: BlogViewService,
    public readonly i18n: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadBlogs();

    this.sub.add(
      this.signalR.newBlogPost$.subscribe(() => {
        this.pageIndex = 0;
        this.loadBlogs();
      })
    );
  }

  loadBlogs(): void {
    const pageNumber = this.pageIndex + 1;
    this.loading = true;

    this.blogService
      .getAll({
        pageNumber,
        pageSize: this.pageSize,
        orderBy: this.sortBy,
        orderDirection: this.sortDirection,
        searchTerm: this.searchTerm.trim() || undefined,
        onlyPublished: true
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          this.blogs = (res.data || []) as GetBlogPostDto[];
          this.totalCount = res.totalPage ?? this.blogs.length;
          this.likedPostIds = new Set(
            this.blogs.filter(b => b.isLikedByCurrentUser).map(b => b.id)
          );
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

  toggleLike(event: Event, blog: GetBlogPostDto): void {
    event.stopPropagation();
    if (this.likingPostIds.has(blog.id)) return;

    this.likingPostIds.add(blog.id);

    if (this.likedPostIds.has(blog.id)) {
      this.postLikeService.unlikePost(blog.id).subscribe({
        next: () => {
          this.likedPostIds.delete(blog.id);
          blog.likeCount = Math.max(0, blog.likeCount - 1);
          this.likingPostIds.delete(blog.id);
        },
        error: () => { this.likingPostIds.delete(blog.id); }
      });
    } else {
      this.postLikeService.likePost(blog.id).subscribe({
        next: () => {
          this.likedPostIds.add(blog.id);
          blog.likeCount++;
          this.likingPostIds.delete(blog.id);
        },
        error: (err: any) => {
          this.likingPostIds.delete(blog.id);
          const msg = err?.error?.Message || err?.error?.message;
          if (msg) this.notify.error(msg);
        }
      });
    }
  }

  isLiked(blogId: number): boolean {
    return this.likedPostIds.has(blogId);
  }

  viewBlog(blogId: number): void {
    // Görüntülenme kaydı (hata blogu açmayı etkilemesin)
    this.blogViewService.trackView(blogId).subscribe({ error: () => {} });
    this.router.navigate(['/client/blog', blogId]);
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
    this.loadBlogs();
  }

  onTagChange(tagId?: number): void {
    this.selectedTagId = tagId;
    this.pageIndex = 0;
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

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
