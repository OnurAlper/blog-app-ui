import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/shared/notification.service';
import { TagService } from 'src/app/core/services/tag.service';
import { CreateTagDto } from 'src/app/core/models/tag.model';

@Component({
  selector: 'app-tag-create',
  templateUrl: './tag-create.component.html',
  styleUrls: ['./tag-create.component.scss'],
  standalone: false
})
export class TagCreateComponent {
  loading = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(64)]]
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private tagService: TagService,
    private notify: NotificationService,
    public i18n: TranslateService
  ) {}

  submit(): void {
    if (this.form.invalid || this.loading) return;

    const dto: CreateTagDto = { name: this.form.value.name!.trim() };
    if (!dto.name) return;

    this.loading = true;
    this.tagService
      .createTag(dto)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          const backendMsg = (res as any)?.Message || (res as any)?.message;
          this.notify.success(backendMsg || this.i18n.instant('COMMON.CREATE_SUCCESS'));
          this.router.navigate(['/tags']);
        },
        error: (err) => {
          const backendMsg = err?.error?.Message || err?.error?.message;
          this.notify.error(backendMsg || this.i18n.instant('COMMON.CREATE_FAILED'));
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/tags']);
  }
}
