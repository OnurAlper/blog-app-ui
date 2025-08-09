import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, startWith, switchMap, map, finalize } from 'rxjs/operators';
import { BlogService } from 'src/app/core/services/blog.service';
import { CategoryService } from 'src/app/core/services/category.service';
import { TagService } from 'src/app/core/services/tag.service';
import { NotificationService } from 'src/app/shared/notification.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

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

  categoryFilterCtrl = new FormControl('');
  tagFilterCtrl = new FormControl('');

  filteredCategories!: Observable<{ id: number; name: string }[]>;
  filteredTags!: Observable<{ id: number; name: string }[]>;

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
      tagIds: [[]]
    });
  }

  ngOnInit(): void {
    this.filteredCategories = this.categoryFilterCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(value => value ?? ''),
      switchMap(search =>
        this.categoryService.getCategories(search).pipe(
          map(res => res.data || [])
        )
      )
    );

    this.filteredTags = this.tagFilterCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(value => value ?? ''),
      switchMap(search =>
        this.tagService.getAllTags(1, 2147483647, 'Name', 'asc', search).pipe(
          map(res => res.data || [])
        )
      )
    );
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control?.invalid && (control.dirty || control.touched));
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

      if (!allowedTypes.includes(file.type)) {
        this.notify.error(
          this.i18n.instant('BLOG.VALIDATION.INVALID_IMAGE_TYPE') ||
          'Sadece PNG veya JPG dosyaları yükleyebilirsiniz.'
        );
        (event.target as HTMLInputElement).value = ''; // input temizlenir
        return;
      }

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
      tagIds: Array.isArray(this.form.get('tagIds')?.value) ? this.form.get('tagIds')?.value : [],
      coverImage: this.selectedFile
    };

    this.loading = true;
    this.blogService.create(dto)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res) => {
          const backendMsg = res?.message;
          this.notify.success(backendMsg || this.i18n.instant('BLOG.CREATE_SUCCESS'));
          this.router.navigate(['/blog']);
        },
        error: (err) => {
          const backendMsg = err?.error?.Message || err?.error?.message;
          this.notify.error(backendMsg || this.i18n.instant('COMMON.ERROR'));
        }
      });
  }
}
