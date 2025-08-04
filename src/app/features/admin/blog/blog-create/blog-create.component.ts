import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BlogService } from 'src/app/core/services/blog.service';
import { NotificationService } from 'src/app/shared/notification.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-blog-create',
  templateUrl: './blog-create.component.html',
  styleUrls: ['./blog-create.component.scss'],
  standalone: false
})
export class BlogCreateComponent {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private notify: NotificationService,
    private router: Router,
    public i18n: TranslateService
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      coverImageUrl: [''],
      categoryId: [null]
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control?.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.blogService.create(this.form.value)
      .subscribe({
        next: (res) => {
          this.notify.success(res.message || this.i18n.instant('BLOG.CREATE_SUCCESS'));
          this.router.navigate(['/blog']);
        },
        error: (err) => {
          this.notify.error(err?.error?.message || this.i18n.instant('COMMON.ERROR'));
        }
      }).add(() => this.loading = false);
  }
}