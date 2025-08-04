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
  selectedFile: File | null = null;
  previewImage: string | null = null;

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
      categoryId: [null]
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control?.invalid && (control.dirty || control.touched));
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;

      // Preview göstermek için
      const reader = new FileReader();
      reader.onload = e => this.previewImage = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.form.invalid || !this.selectedFile) {
      this.form.markAllAsTouched();
      this.notify.error(this.i18n.instant('BLOG.VALIDATION.REQUIRED_IMAGE'));
      return;
    }
  
    const dto = {
      title: this.form.get('title')?.value,
      content: this.form.get('content')?.value,
      categoryId: this.form.get('categoryId')?.value,
      coverImage: this.selectedFile // 📌 Dikkat: burada File tipinde
    };
  
    this.loading = true;
    this.blogService.create(dto) // ✅ Artık CreateBlogPostDto tipinde
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
