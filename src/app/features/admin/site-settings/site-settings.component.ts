import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { SiteSettingsService } from 'src/app/core/services/site-settings.service';
import { NotificationService } from 'src/app/shared/notification.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-site-settings',
  templateUrl: './site-settings.component.html',
  styleUrls: ['./site-settings.component.scss'],
  standalone: false
})
export class SiteSettingsComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  saving = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly siteSettingsService: SiteSettingsService,
    private readonly notify: NotificationService,
    public readonly i18n: TranslateService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadSettings();
  }

  buildForm(): void {
    this.form = this.fb.group({
      bannerTitle: ['', [Validators.required, Validators.maxLength(200)]],
      bannerSubtitle: ['', [Validators.maxLength(400)]],
      bannerDescription: ['', [Validators.maxLength(800)]],
      bannerButtonText: ['', [Validators.maxLength(100)]],
      bannerImageUrl: ['', [Validators.maxLength(500)]]
    });
  }

  loadSettings(): void {
    this.loading = true;
    this.siteSettingsService.getSettings()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data: any) => {
          const s = data?.data ?? data;
          this.form.patchValue({
            bannerTitle: s.bannerTitle ?? '',
            bannerSubtitle: s.bannerSubtitle ?? '',
            bannerDescription: s.bannerDescription ?? '',
            bannerButtonText: s.bannerButtonText ?? '',
            bannerImageUrl: s.bannerImageUrl ?? ''
          });
        },
        error: () => this.notify.error('Ayarlar yüklenemedi.')
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto = {
      bannerTitle: this.form.value.bannerTitle?.trim(),
      bannerSubtitle: this.form.value.bannerSubtitle?.trim() || null,
      bannerDescription: this.form.value.bannerDescription?.trim() || null,
      bannerButtonText: this.form.value.bannerButtonText?.trim() || null,
      bannerImageUrl: this.form.value.bannerImageUrl?.trim() || null
    };

    this.saving = true;
    this.siteSettingsService.updateSettings(dto as any)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => this.notify.success('Ayarlar güncellendi.'),
        error: (err: any) => {
          const msg = err?.error?.Message || err?.error?.message;
          this.notify.error(msg || 'Güncelleme başarısız.');
        }
      });
  }
}
