import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/shared/notification.service';
import { UserService } from 'src/app/core/services/user.service';
import { CountryService } from 'src/app/core/services/country.service';
import { Router } from '@angular/router';
import { SignupRequestDto } from 'src/app/core/models/user.model';
import { GenderType } from 'src/app/core/models/gender.enum';
import { GetCountryDto } from 'src/app/core/models/country.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit, OnDestroy {
  signupForm!: FormGroup;
  loading = false;
  currentLang: 'tr' | 'en' = 'tr';

  genders = [
    { value: GenderType.Male, label: 'GENDER.MALE' },
    { value: GenderType.Female, label: 'GENDER.FEMALE' },
  ];

  countries: GetCountryDto[] = [];
  filteredCountries: GetCountryDto[] = [];

  // Yeni eklenecek olanlar:
  countryControl = new FormControl();
  countryFilterControl = new FormControl();

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private userService: UserService,
    private countryService: CountryService,
    private router: Router,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    const savedLang = (localStorage.getItem('language') as 'tr' | 'en') || 'tr';
    this.currentLang = savedLang;
    this.translate.use(savedLang);

    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: [''],
      birthDate: ['', Validators.required],
      gender: ['', Validators.required],
      countryId: ['', Validators.required],
    });

    this.fetchCountries();

    // Arama kutusu yazıldıkça ülke listesini filtrele
    this.countryFilterControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((search: string) => {
        const term = search?.toLowerCase() || '';
        this.filteredCountries = this.countries.filter(c =>
          c.name.toLowerCase().includes(term)
        );
      });

    // Seçilen ülkeyi formControl'e set et
    this.countryControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(val => {
        this.signupForm.get('countryId')?.setValue(val);
      });
  }

  fetchCountries(): void {
    this.countryService.getAll().subscribe({
      next: (res) => {
        this.countries = res.data || [];
        this.filteredCountries = [...this.countries];
      },
      error: () => {
        this.notification.error(this.translate.instant('SIGNUP.COUNTRY_FETCH_ERROR'));
      },
    });
  }

  switchLang(lang: 'tr' | 'en'): void {
    this.currentLang = lang;
    localStorage.setItem('language', lang);
    this.translate.use(lang);
    this.fetchCountries();
  }

  onSubmit(): void {
    if (this.signupForm.invalid) return;

    this.loading = true;
    const request: SignupRequestDto = this.signupForm.value;

    this.userService.signup(request).subscribe({
      next: (res) => {
        const response = res?.data;

        if (response?.isCreated) {
          this.notification.success(
            response.message || this.translate.instant('SIGNUP.SUCCESS')
          );
          this.router.navigate(['/login']);
        } else {
          this.notification.error(
            response?.message || this.translate.instant('SIGNUP.FAILURE')
          );
        }
      },
      error: (err) => {
        const backendMsg = err?.error?.Message || err?.error?.message;
        const translatedMsg = backendMsg || this.translate.instant('SIGNUP.FAILURE');
        this.notification.error(translatedMsg);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
