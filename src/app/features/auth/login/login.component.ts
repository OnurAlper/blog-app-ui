import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/services/user.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/shared/notification.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  error: string = '';
  loading: boolean = false;
  currentLang: 'tr' | 'en' = 'tr';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private notification: NotificationService,
    private translate: TranslateService
  ) {
    this.loginForm = this.fb.group({
      usernameOrEmail: ['', Validators.required],
      password: ['', Validators.required],
      staySignedIn: [false]
    });
  }

 ngOnInit(): void {
    const savedLang = localStorage.getItem('language') as 'tr' | 'en' || 'tr';
    this.currentLang = savedLang;
    this.translate.use(savedLang);
  }

  switchLang(lang: 'tr' | 'en'): void {
    this.currentLang = lang;
    localStorage.setItem('language', lang);
    this.translate.use(lang);
  }

onSubmit(): void {
  if (this.loginForm.invalid) return;

  this.loading = true;
  const { usernameOrEmail, password, staySignedIn } = this.loginForm.value;

  this.userService.login({ usernameOrEmail, password, staySignedIn }).subscribe({
    next: (res) => {
      const token = res?.data?.token;
      const refreshToken = res?.data?.refreshToken;
      const userId = res?.data?.id;

      if (token && userId) {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId.toString());

        // 🧠 refreshToken sadece "beni hatırla" aktifse saklanır, aksi halde silinir
        if (staySignedIn && refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        } else {
          localStorage.removeItem('refreshToken');
        }

        this.router.navigate(['/dashboard']);
      } else {
        this.notification.error(this.translate.instant('LOGIN.FAILURE'));
      }
    },
    error: (err) => {
      const backendMsg = err?.error?.Message || err?.error?.message;
      const translatedMsg = backendMsg || this.translate.instant('LOGIN.FAILURE');

      this.notification.error(translatedMsg);
      this.loading = false;
    },
    complete: () => {
      this.loading = false;
    }
  });
}
}
