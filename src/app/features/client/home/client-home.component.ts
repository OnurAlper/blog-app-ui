import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { SiteSettingsService } from 'src/app/core/services/site-settings.service';
import { BlogService } from 'src/app/core/services/blog.service';
import { CategoryService } from 'src/app/core/services/category.service';
import { SiteSettings } from 'src/app/core/models/site-settings.model';
import { GetBlogPostDto } from 'src/app/core/models/blog.model';
import { GetCategoryDto } from 'src/app/core/models/category.model';

@Component({
  selector: 'app-client-home',
  templateUrl: './client-home.component.html',
  styleUrls: ['./client-home.component.scss'],
  standalone: false
})
export class ClientHomeComponent implements OnInit {
  settings: SiteSettings = {
    bannerTitle: 'Blog Dünyasına Hoş Geldiniz',
    bannerSubtitle: 'En güncel yazılar, ipuçları ve teknoloji haberleri',
    bannerDescription: 'Uzman yazarlarımızın kaleme aldığı içerikleri keşfedin.',
    bannerButtonText: 'Yazıları Keşfet',
    bannerImageUrl: null
  };

  recentPosts: GetBlogPostDto[] = [];
  loadingPosts = false;
  categories: GetCategoryDto[] = [];
  selectedCategoryId: number | null = null;

  constructor(
    private readonly settingsService: SiteSettingsService,
    private readonly blogService: BlogService,
    private readonly categoryService: CategoryService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadSettings();
    this.loadRecentPosts();
    this.loadCategories();
  }

  loadSettings(): void {
    this.settingsService.getSettings().subscribe({
      next: (data) => { this.settings = data; },
      error: () => {}
    });
  }

  loadRecentPosts(): void {
    this.loadingPosts = true;
    this.blogService.getAll({ pageNumber: 1, pageSize: 12, orderBy: 'CreatedAt', orderDirection: 'desc' })
      .pipe(finalize(() => (this.loadingPosts = false)))
      .subscribe({
        next: (res: any) => { this.recentPosts = res.data || []; },
        error: () => { this.recentPosts = []; }
      });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => { this.categories = res.data || []; },
      error: () => {}
    });
  }

  get filteredPosts(): GetBlogPostDto[] {
    if (this.selectedCategoryId === null) return this.recentPosts;
    return this.recentPosts.filter(p => p.categoryId === this.selectedCategoryId);
  }

  selectCategory(id: number | null): void {
    this.selectedCategoryId = id;
  }

  goToBlogs(): void {
    this.router.navigate(['/client/blogs']);
  }

  goToPost(postId: number): void {
    this.router.navigate(['/client/blog', postId]);
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  truncate(text: string, max = 120): string {
    if (!text) return '';
    const clean = text.replace(/<[^>]*>/g, '');
    return clean.length > max ? clean.substring(0, max) + '...' : clean;
  }
}
