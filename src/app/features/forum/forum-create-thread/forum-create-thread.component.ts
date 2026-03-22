import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ForumService } from 'src/app/core/services/forum.service';
import { NotificationService } from 'src/app/shared/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { ForumCategory } from 'src/app/core/models/forum.model';

@Component({
  selector: 'app-forum-create-thread',
  standalone: false,
  templateUrl: './forum-create-thread.component.html',
  styleUrls: ['./forum-create-thread.component.scss']
})
export class ForumCreateThreadComponent implements OnInit {
  categories: ForumCategory[] = [];
  loading = false;
  submitting = false;

  form = new FormGroup({
    categoryId: new FormControl<number | null>(null, Validators.required),
    title: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(300)]),
    content: new FormControl('', [Validators.required, Validators.minLength(10)]),
    isAnnouncement: new FormControl(false)
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private forumService: ForumService,
    private notify: NotificationService,
    public i18n: TranslateService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.forumService.getCategories()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.categories = (res?.data as any) || [];
          const catId = this.route.snapshot.queryParams['categoryId'];
          if (catId) this.form.patchValue({ categoryId: +catId });
        },
        error: () => {}
      });
  }

  submit(): void {
    if (this.form.invalid || this.submitting) return;
    this.submitting = true;
    const val = this.form.value;
    this.forumService.createThread({ title: val.title!, content: val.content!, categoryId: val.categoryId!, isAnnouncement: val.isAnnouncement ?? false })
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: (res) => {
          const id = (res as any)?.data?.id;
          this.notify.success(this.i18n.instant('FORUM.THREAD_CREATED'));
          if (id) this.router.navigate(['/forum/thread', id]);
          else this.router.navigate(['/forum/category', val.categoryId]);
        },
        error: (err) => this.notify.error(err?.error?.Message || this.i18n.instant('COMMON.ERROR'))
      });
  }

  cancel(): void {
    const catId = this.route.snapshot.queryParams['categoryId'];
    if (catId) this.router.navigate(['/forum/category', catId]);
    else this.router.navigate(['/forum']);
  }
}
