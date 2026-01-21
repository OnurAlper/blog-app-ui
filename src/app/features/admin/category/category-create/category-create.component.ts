import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/shared/notification.service';
import { CategoryService } from 'src/app/core/services/category.service';
import { CreateCategoryDto } from 'src/app/core/models/category.model';

@Component({
  selector: 'app-category-create',
  templateUrl: './category-create.component.html',
  styleUrls: ['./category-create.component.scss'],
  standalone: false
})
export class CategoryCreateComponent implements OnInit {
  form!: FormGroup;
  loading = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly categoryService: CategoryService,
    private readonly router: Router,
    private readonly notify: NotificationService,
    public readonly i18n: TranslateService
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notify.error(this.i18n.instant('COMMON.FORM_INVALID')); // ✅ warning → error
      return;
    }

    const dto: CreateCategoryDto = {
      name: this.form.value.name?.trim()
    };

    this.loading = true;
    this.categoryService
      .createCategory(dto)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          const backendMsg = (res as any)?.Message || (res as any)?.message;
          this.notify.success(backendMsg || this.i18n.instant('COMMON.CREATE_SUCCESS'));
          this.router.navigate(['/categories']);
        },
        error: (err) => {
          const backendMsg = err?.error?.Message || err?.error?.message;
          this.notify.error(backendMsg || this.i18n.instant('COMMON.CREATE_FAILED'));
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/categories']);
  }
}