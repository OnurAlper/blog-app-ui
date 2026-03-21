import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ForumService } from 'src/app/core/services/forum.service';
import { NotificationService } from 'src/app/shared/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ForumCategory } from 'src/app/core/models/forum.model';

@Component({
  selector: 'app-forum-home',
  standalone: false,
  templateUrl: './forum-home.component.html',
  styleUrls: ['./forum-home.component.scss']
})
export class ForumHomeComponent implements OnInit {
  categories: ForumCategory[] = [];
  loading = false;

  constructor(
    private forumService: ForumService,
    private notify: NotificationService,
    public i18n: TranslateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.forumService.getCategories()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => { this.categories = (res?.data as any) || []; },
        error: (err) => {
          this.notify.error(err?.error?.Message || this.i18n.instant('COMMON.ERROR'));
        }
      });
  }

  goToCategory(category: ForumCategory): void {
    this.router.navigate(['/forum/category', category.id]);
  }
}
