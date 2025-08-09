import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/shared/notification.service';
import { TagService } from 'src/app/core/services/tag.service';
import { GetTagDto, UpdateTagDto } from 'src/app/core/models/tag.model';

@Component({
  selector: 'app-tag-edit',
  templateUrl: './tag-edit.component.html',
  styleUrls: ['./tag-edit.component.scss'],
  standalone: false
})
export class TagEditComponent implements OnInit {
  loading = false;
  private id!: number; // sadece iç kullanım

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(64)]]
  });

  get hasUnsavedChanges(): boolean {
    return this.form.dirty && !this.loading;
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private tagService: TagService,
    private notify: NotificationService,
    public i18n: TranslateService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.id) { this.router.navigate(['/tags']); return; }

    this.loading = true;
    this.tagService.getTagById(this.id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          const tag: GetTagDto = res?.data ?? res; // envelope/dto tolerant
          this.form.patchValue({ name: tag.name });
          this.form.markAsPristine();
        },
        error: (err) => {
          const backendMsg = err?.error?.Message || err?.error?.message;
          this.notify.error(backendMsg || this.i18n.instant('COMMON.ERROR'));
          this.router.navigate(['/tags']);
        }
      });
  }

  submit(): void {
    if (this.form.invalid || this.loading) return;

    const dto: UpdateTagDto = { id: this.id, name: this.form.value.name!.trim() };
    if (!dto.name) return;

    this.loading = true;
    this.tagService.updateTag(dto)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          const backendMsg = res?.Message || res?.message;
          this.notify.success(backendMsg || this.i18n.instant('COMMON.UPDATE_SUCCESS'));
          this.form.markAsPristine();
          this.router.navigate(['/tags']);
        },
        error: (err) => {
          const backendMsg = err?.error?.Message || err?.error?.message;
          this.notify.error(backendMsg || this.i18n.instant('COMMON.UPDATE_FAILED'));
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/tags']);
  }
}
