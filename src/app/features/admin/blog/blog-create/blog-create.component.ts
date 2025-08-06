import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BlogService } from 'src/app/core/services/blog.service';
import { NotificationService } from 'src/app/shared/notification.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CategoryService } from 'src/app/core/services/category.service';
import { TagService } from 'src/app/core/services/tag.service';

@Component({
  selector: 'app-blog-create',
  templateUrl: './blog-create.component.html',
  styleUrls: ['./blog-create.component.scss'],
  standalone: false
})
export class BlogCreateComponent implements OnInit {
  form: FormGroup;
  loading = false;
  selectedFile: File | null = null;
  previewImage: string | null = null;

  categories: { id: number; name: string }[] = [];
  tags: { id: number; name: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private categoryService: CategoryService,
    private tagService: TagService,
    private notify: NotificationService,
    private router: Router,
    public i18n: TranslateService
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      categoryId: [null, Validators.required],
      tagIds: [[]] // Çoklu seçim için boş array
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadTags();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: res => this.categories = res.data || [],
      error: () => this.notify.error(this.i18n.instant('COMMON.ERROR'))
    });
  }

  loadTags(): void {
    this.tagService.getAllTags().subscribe({
      next: res => this.tags = res.data || [],
      error: () => this.notify.error(this.i18n.instant('COMMON.ERROR'))
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

      const reader = new FileReader();
      reader.onload = e => this.previewImage = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.form.invalid || !this.selectedFile) {
      this.form.markAllAsTouched();
      if (!this.selectedFile) {
        this.notify.error(this.i18n.instant('BLOG.VALIDATION.REQUIRED_IMAGE'));
      }
      return;
    }

    const dto = {
      title: this.form.get('title')?.value,
      content: this.form.get('content')?.value,
      categoryId: this.form.get('categoryId')?.value,
      tagIds: this.form.get('tagIds')?.value,
      coverImage: this.selectedFile
    };

    this.loading = true;
    this.blogService.create(dto).subscribe({
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
