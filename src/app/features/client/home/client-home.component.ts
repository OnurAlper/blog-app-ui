import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { BannerService } from 'src/app/core/services/banner.service';
import { BlogService } from 'src/app/core/services/blog.service';
import { CategoryService } from 'src/app/core/services/category.service';
import { Banner } from 'src/app/core/models/banner.model';
import { GetBlogPostDto } from 'src/app/core/models/blog.model';
import { GetCategoryDto } from 'src/app/core/models/category.model';

@Component({
  selector: 'app-client-home',
  templateUrl: './client-home.component.html',
  styleUrls: ['./client-home.component.scss'],
  standalone: false
})
export class ClientHomeComponent implements OnInit, OnDestroy {
  banners: Banner[] = [];
  currentSlide = 0;
  private slideInterval: any;

  recentPosts: GetBlogPostDto[] = [];
  loadingPosts = false;
  categories: GetCategoryDto[] = [];
  selectedCategoryId: number | null = null;

  constructor(
    private readonly bannerService: BannerService,
    private readonly blogService: BlogService,
    private readonly categoryService: CategoryService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadBanners();
    this.loadRecentPosts();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    clearInterval(this.slideInterval);
  }

  loadBanners(): void {
    this.bannerService.getActive().subscribe({
      next: (r: any) => {
        this.banners = (r?.data as any) || [];
        if (this.banners.length > 1) this.startSlider();
      },
      error: () => {}
    });
  }

  startSlider(): void {
    this.slideInterval = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.banners.length;
    }, 5000);
  }

  goToSlide(i: number): void {
    this.currentSlide = i;
    clearInterval(this.slideInterval);
    if (this.banners.length > 1) this.startSlider();
  }

  prevSlide(): void {
    this.goToSlide((this.currentSlide - 1 + this.banners.length) % this.banners.length);
  }

  nextSlide(): void {
    this.goToSlide((this.currentSlide + 1) % this.banners.length);
  }

  get activeBanner(): Banner | null {
    return this.banners[this.currentSlide] ?? null;
  }

  getBannerStyle(b: Banner): { [key: string]: string } {
    if (b.imageUrl) {
      return {
        'background-image': `linear-gradient(to top, rgba(28,29,31,.88) 0%, rgba(28,29,31,.35) 60%, rgba(28,29,31,.1) 100%), url(${b.imageUrl})`,
        'background-size': 'cover',
        'background-position': 'center'
      };
    }
    return {
      'background': `linear-gradient(to top, rgba(0,0,0,.55) 0%, rgba(0,0,0,.1) 100%), linear-gradient(${b.gradientAngle}deg, ${b.gradientColor1}, ${b.gradientColor2})`
    };
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
