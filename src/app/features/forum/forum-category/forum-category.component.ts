import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ForumService } from 'src/app/core/services/forum.service';
import { NotificationService } from 'src/app/shared/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ForumThread } from 'src/app/core/models/forum.model';

@Component({
  selector: 'app-forum-category',
  standalone: false,
  templateUrl: './forum-category.component.html',
  styleUrls: ['./forum-category.component.scss']
})
export class ForumCategoryComponent implements OnInit {
  categoryId!: number;
  categoryName = '';
  threads: ForumThread[] = [];
  loading = false;
  searchTerm = '';
  pageIndex = 0;
  pageSize = 20;
  totalCount = 0;
  private searchDebounce: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private forumService: ForumService,
    private notify: NotificationService,
    public i18n: TranslateService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(p => {
      this.categoryId = +p['id'];
      this.load();
    });
  }

  load(): void {
    this.loading = true;
    this.forumService.getThreads(this.categoryId, this.pageIndex + 1, this.pageSize, this.searchTerm || undefined)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.threads = (res?.data as any) || [];
          this.totalCount = (res as any)?.totalPage ?? this.threads.length;
          if (this.threads.length) this.categoryName = this.threads[0].categoryName;
        },
        error: (err) => this.notify.error(err?.error?.Message || this.i18n.instant('COMMON.ERROR'))
      });
  }

  onSearchInput(val: string): void {
    this.searchTerm = val;
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => { this.pageIndex = 0; this.load(); }, 350);
  }

  openThread(thread: ForumThread): void {
    this.router.navigate(['/forum/thread', thread.id]);
  }

  createThread(): void {
    this.router.navigate(['/forum/create'], { queryParams: { categoryId: this.categoryId } });
  }

  goBack(): void {
    this.router.navigate(['/forum']);
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
