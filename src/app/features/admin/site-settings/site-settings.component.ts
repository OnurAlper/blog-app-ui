import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { BannerService } from 'src/app/core/services/banner.service';
import { NotificationService } from 'src/app/shared/notification.service';
import { Banner } from 'src/app/core/models/banner.model';

@Component({
  selector: 'app-site-settings',
  templateUrl: './site-settings.component.html',
  styleUrls: ['./site-settings.component.scss'],
  standalone: false
})
export class SiteSettingsComponent implements OnInit {
  banners: Banner[] = [];
  loading = false;
  saving = false;

  editingBanner: Banner | null = null;
  showForm = false;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private bannerService: BannerService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadBanners();
  }

  buildForm(banner?: Banner): void {
    this.form = this.fb.group({
      title: [banner?.title ?? '', [Validators.required, Validators.maxLength(200)]],
      subtitle: [banner?.subtitle ?? '', [Validators.maxLength(400)]],
      description: [banner?.description ?? '', [Validators.maxLength(800)]],
      buttonText: [banner?.buttonText ?? 'Keşfet', [Validators.maxLength(100)]],
      imageUrl: [banner?.imageUrl ?? '', [Validators.maxLength(1000)]],
      gradientColor1: [banner?.gradientColor1 ?? '#1c1d1f'],
      gradientColor2: [banner?.gradientColor2 ?? '#ec5b13'],
      gradientAngle: [banner?.gradientAngle ?? 135, [Validators.min(0), Validators.max(360)]],
      orderIndex: [banner?.orderIndex ?? 0],
      isActive: [banner?.isActive ?? true]
    });
  }

  loadBanners(): void {
    this.loading = true;
    this.bannerService.getAll()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (r: any) => { this.banners = (r?.data as any) || []; },
        error: () => this.notify.error('Bannerlar yüklenemedi.')
      });
  }

  openCreate(): void {
    this.editingBanner = null;
    this.buildForm();
    this.showForm = true;
  }

  openEdit(b: Banner): void {
    this.editingBanner = b;
    this.buildForm(b);
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingBanner = null;
  }

  get previewGradient(): string {
    const v = this.form.value;
    return `linear-gradient(${v.gradientAngle}deg, ${v.gradientColor1}, ${v.gradientColor2})`;
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    const dto = {
      title: v.title.trim(),
      subtitle: v.subtitle?.trim() || null,
      description: v.description?.trim() || null,
      buttonText: v.buttonText?.trim() || 'Keşfet',
      imageUrl: v.imageUrl?.trim() || null,
      gradientColor1: v.gradientColor1,
      gradientColor2: v.gradientColor2,
      gradientAngle: +v.gradientAngle,
      orderIndex: +v.orderIndex,
      isActive: v.isActive
    };

    this.saving = true;
    const obs$ = this.editingBanner
      ? this.bannerService.update({ ...dto, id: this.editingBanner.id })
      : this.bannerService.create(dto);

    obs$.pipe(finalize(() => (this.saving = false))).subscribe({
      next: () => {
        this.notify.success(this.editingBanner ? 'Banner güncellendi.' : 'Banner oluşturuldu.');
        this.cancelForm();
        this.loadBanners();
      },
      error: (err: any) => this.notify.error(err?.error?.Message || 'Kayıt başarısız.')
    });
  }

  deleteBanner(id: number): void {
    if (!confirm('Bu banneri silmek istediğinize emin misiniz?')) return;
    this.bannerService.deleteBanner(id).subscribe({
      next: () => { this.notify.success('Banner silindi.'); this.loadBanners(); },
      error: (err: any) => this.notify.error(err?.error?.Message || 'Silme başarısız.')
    });
  }

  toggleActive(b: Banner): void {
    this.bannerService.update({ ...b, isActive: !b.isActive }).subscribe({
      next: () => { this.notify.success('Durum güncellendi.'); this.loadBanners(); },
      error: (err: any) => this.notify.error(err?.error?.Message || 'Güncelleme başarısız.')
    });
  }

  getBannerBg(b: Banner): string {
    if (b.imageUrl) return `url(${b.imageUrl})`;
    return `linear-gradient(${b.gradientAngle}deg, ${b.gradientColor1}, ${b.gradientColor2})`;
  }
}
