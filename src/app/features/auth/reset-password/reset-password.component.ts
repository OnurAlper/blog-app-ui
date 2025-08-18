import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/shared/notification.service';
import { UserService } from 'src/app/core/services/user.service';
import { PasswordResetConfirmDto } from 'src/app/core/models/user.model';

function matchPassword(group: AbstractControl): ValidationErrors | null {
  const p = group.get('newPassword')?.value;
  const c = group.get('confirmPassword')?.value;
  return p && c && p !== c ? { mismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  standalone: false
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: matchPassword });

  loading = true;
  token = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private t: TranslateService,
    private notify: NotificationService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap.get('token');
    if (!q) {
      this.loading = false;
      this.notify.error(this.t.instant('Auth.Reset.InvalidLink'));
      return;
    }
    this.token = q;
    this.loading = false;
  }

  submit(): void {
    if (this.form.invalid || !this.token) return;
    this.loading = true;

    const dto: PasswordResetConfirmDto = {
      token: this.token,
      newPassword: this.form.value.newPassword,
      confirmPassword: this.form.value.confirmPassword
    };

    this.userService.confirmPasswordReset(dto).subscribe({
      next: (res: any) => {
        this.loading = false;
        const msg = res?.data?.message || res?.message || res?.Message
          || this.t.instant('Auth.Reset.Success');
        this.notify.success(msg, 3000);
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.Message || err?.error?.message
          || this.t.instant('Auth.Reset.Fail');
        this.notify.error(msg, 4000);
      }
    });
  }

  get mismatch(): boolean {
    return !!this.form.errors?.['mismatch'] && !!this.form.get('confirmPassword')?.touched;
  }
}
