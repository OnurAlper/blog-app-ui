import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/shared/notification.service';
import { CategoryService } from 'src/app/core/services/category.service';
import { UpdateCategoryDto, GetCategoryDto } from 'src/app/core/models/category.model';

@Component({
  selector: 'app-category-edit',
  templateUrl: './category-edit.component.html',
  styleUrls: ['./category-edit.component.scss'],
  standalone: false
})
export class CategoryEditComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  categoryId!: number;
  category?: GetCategoryDto;

  constructor(
    private readonly fb: FormBuilder,
    private readonly categoryService: CategoryService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly notify: NotificationService,
    public readonly i18n: TranslateService
  ) {}

  ngOnInit(): void {
    this.categoryId = Number(this.route.snapshot.paramMap.get('id'));
    this.buildForm();
    this.loadCategory();
  }

  buildForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]]
    });
  }

  loadCategory(): void {
    this.loading = true;
    this.categoryService
      .getCategoryById(this.categoryId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data) => {
          this.category = data;
          this.form.patchValue({
            name: data.name
          });
        },
        error: (err) => {
          const backendMsg = err?.error?.Message || err?.error?.message;
          this.notify.error(backendMsg || this.i18n.instant('COMMON.LOAD_FAILED'));
          this.router.navigate(['/categories']);
        }
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notify.error(this.i18n.instant('COMMON.FORM_INVALID')); // ✅ warning → error
      return;
    }

    const dto: UpdateCategoryDto = {
      id: this.categoryId,
      name: this.form.value.name?.trim()
    };

    this.loading = true;
    this.categoryService
      .updateCategory(dto)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          const backendMsg = (res as any)?.Message || (res as any)?.message;
          this.notify.success(backendMsg || this.i18n.instant('COMMON.UPDATE_SUCCESS'));
          this.router.navigate(['/categories']);
        },
        error: (err) => {
          const backendMsg = err?.error?.Message || err?.error?.message;
          this.notify.error(backendMsg || this.i18n.instant('COMMON.UPDATE_FAILED'));
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/categories']);
  }

  canDeactivate(): boolean {
    if (this.form.dirty) {
      return confirm(this.i18n.instant('COMMON.UNSAVED_CHANGES'));
    }
    return true;
  }
}