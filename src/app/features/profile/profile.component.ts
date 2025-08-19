import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/shared/notification.service';
import { UserService } from 'src/app/core/services/user.service';
import { CountryService } from 'src/app/core/services/country.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { UpdateProfileDto, GetUserDto, ChangePasswordDto } from 'src/app/core/models/user.model';
import { GenderType } from 'src/app/core/models/gender.enum';
import { GetCountryDto } from 'src/app/core/models/country.model';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: false
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  destroy$ = new Subject<void>();
  countries: GetCountryDto[] = [];
  filteredCountries: GetCountryDto[] = [];
  countrySearchTerm = '';

  selectedDialCode = '+90';
  profileImagePreview: string | null = null;
  defaultImage = 'assets/user.png';

  // görüntülenen profilin ID’si
  private viewedUserId!: number;

  genders = [
    { value: GenderType.Male, label: 'GENDER.MALE' },
    { value: GenderType.Female, label: 'GENDER.FEMALE' }
  ];

  // kendi profilim mi?
  isOwnProfile = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private countryService: CountryService,
    private translate: TranslateService,
    private notification: NotificationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const lang = (localStorage.getItem('language') as 'tr' | 'en') || 'tr';
    this.translate.use(lang);

    this.initProfileForm();
    this.initPasswordForm();

    this.loadUser();
    this.fetchCountries();
  }

  initProfileForm(): void {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      birthDate: ['', Validators.required],
      gender: ['', Validators.required],
      countryId: ['', Validators.required],
      profileImageUrl: ['']
    });
  }

  initPasswordForm(): void {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onCountrySearch(search: string): void {
    const term = (search || '').toLowerCase();
    this.filteredCountries = this.countries.filter(c => c.name.toLowerCase().includes(term));
  }

  loadUser(): void {
    const routeId = this.route.snapshot.paramMap.get('id');
    const loggedInUserId = Number(localStorage.getItem('userId'));
    this.viewedUserId = routeId ? Number(routeId) : loggedInUserId;

    this.isOwnProfile = this.viewedUserId === loggedInUserId;
    if (!this.viewedUserId) return;

    this.userService.getById(this.viewedUserId).subscribe({
      next: res => {
        const data = res.data as GetUserDto;

        this.profileImagePreview = data.profileImageUrl || this.defaultImage;

        this.profileForm.patchValue({
          ...data,
          birthDate: data.birthDate?.substring(0, 10),
          gender: data.gender,
          countryId: data.countryId
        });

        this.onCountryChange(data.countryId);
      },
      error: () => {
        this.notification.error(this.translate.instant('PROFILE.LOAD_ERROR'));
      }
    });
  }

  fetchCountries(): void {
    this.countryService.getAll().subscribe({
      next: res => {
        this.countries = res.data || [];
        this.filteredCountries = [...this.countries];
      },
      error: () => {
        this.notification.error(this.translate.instant('PROFILE.COUNTRY_FETCH_ERROR'));
      }
    });
  }

  onCountryChange(countryId: number): void {
    const selected = this.countries.find(c => c.id === countryId);
    if (selected) {
      this.selectedDialCode = selected.dial_Code || '+90';
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.profileImagePreview = reader.result as string;
      this.profileForm.get('profileImageUrl')?.setValue(this.profileImagePreview);
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    // ✅ ID’yi request’e ekliyoruz
    const form = this.profileForm.value;
    const request: UpdateProfileDto = {
      id: this.viewedUserId,
      name: form.name,
      surname: form.surname,
      username: form.username,
      email: form.email,
      phoneNumber: form.phoneNumber || undefined,
      birthDate: typeof form.birthDate === 'string'
        ? form.birthDate
        : new Date(form.birthDate).toISOString().substring(0, 10),
      gender: form.gender,
      countryId: form.countryId,
      profileImageUrl: form.profileImageUrl || undefined
    };

    this.userService.updateProfile(request).subscribe({
      next: res => {
        if (res.data?.isUpdated) {
          this.notification.success(res.data.message || this.translate.instant('PROFILE.UPDATE_SUCCESS'));
        } else {
          this.notification.error(this.translate.instant('PROFILE.UPDATE_FAILED'));
        }
      },
      error: err => {
        const backendMsg = err?.error?.Message || err?.error?.message;
        this.notification.error(backendMsg || this.translate.instant('PROFILE.UPDATE_FAILED'));
      }
    });
  }

  onPasswordChange(): void {
    if (!this.isOwnProfile) return; // güvenlik için

    if (this.passwordForm.invalid) {
      this.notification.error(this.translate.instant('VALIDATION.REQUIRED'));
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.notification.error(this.translate.instant('PROFILE.PASSWORD_NOT_MATCH'));
      return;
    }

    const request: ChangePasswordDto = { currentPassword, newPassword };

    this.userService.changePassword(request).subscribe({
      next: res => {
        if (res.data?.isUpdated) {
          this.notification.success(this.translate.instant('PROFILE.PASSWORD_UPDATE_SUCCESS'));
          this.passwordForm.reset();
        } else {
          this.notification.error(this.translate.instant('PROFILE.PASSWORD_UPDATE_FAILED'));
        }
      },
      error: err => {
        const backendMsg = err?.error?.Message || err?.error?.message;
        this.notification.error(backendMsg || this.translate.instant('PROFILE.PASSWORD_UPDATE_FAILED'));
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
