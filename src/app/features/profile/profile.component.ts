import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder, FormGroup, Validators, FormControl
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/shared/notification.service';
import { UserService } from 'src/app/core/services/user.service';
import { CountryService } from 'src/app/core/services/country.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { UpdateProfileDto, GetUserDto } from 'src/app/core/models/user.model';
import { GenderType } from 'src/app/core/models/gender.enum';
import { GetCountryDto } from 'src/app/core/models/country.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: false
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  destroy$ = new Subject<void>();
  countries: GetCountryDto[] = [];
  filteredCountries: GetCountryDto[] = [];
  countryControl = new FormControl();
  countryFilterControl = new FormControl();
  selectedDialCode: string = '+90';
  profileImagePreview: string | null = null;
  defaultImage: string = 'assets/default-avatar.png';

  genders = [
    { value: GenderType.Male, label: 'GENDER.MALE' },
    { value: GenderType.Female, label: 'GENDER.FEMALE' }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private countryService: CountryService,
    private translate: TranslateService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    const lang = (localStorage.getItem('language') as 'tr' | 'en') || 'tr';
    this.translate.use(lang);

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

    this.loadUser();
    this.fetchCountries();

    this.countryFilterControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((search: string) => {
        const term = search?.toLowerCase() || '';
        this.filteredCountries = this.countries.filter(c =>
          c.name.toLowerCase().includes(term)
        );
      });

    this.countryControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(val => {
        this.profileForm.get('countryId')?.setValue(val);
        this.onCountryChange(val);
      });
  }

  loadUser(): void {
    const user = this.authService.getCurrentUser();
    const userId = user?.userId;
    if (!userId) return;

    this.userService.getById(userId).subscribe({
      next: (res) => {
        const data = res.data as GetUserDto;

        this.profileImagePreview = data.profileImageUrl || this.defaultImage;

        this.profileForm.patchValue({
          ...data,
          birthDate: data.birthDate?.substring(0, 10)
        });

        this.countryControl.setValue(data.countryId);
        this.onCountryChange(data.countryId);
      }
    });
  }

  fetchCountries(): void {
    this.countryService.getAll().subscribe({
      next: (res) => {
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

    const request: UpdateProfileDto = this.profileForm.value;

    this.userService.updateProfile(request).subscribe({
      next: (res) => {
        if (res.data?.isUpdated) {
          this.notification.success(
            res.data.message || this.translate.instant('PROFILE.UPDATE_SUCCESS')
          );
        } else {
          this.notification.error(this.translate.instant('PROFILE.UPDATE_FAILED'));
        }
      },
      error: (err) => {
        const backendMsg = err?.error?.Message || err?.error?.message;
        this.notification.error(backendMsg || this.translate.instant('PROFILE.UPDATE_FAILED'));
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
