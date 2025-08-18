import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/shared/notification.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: false
})
export class ForgotPasswordComponent {
  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });
  loading = false;

  constructor(
    private fb: FormBuilder,
    private t: TranslateService,
    private notify: NotificationService,
    private userService: UserService
  ) {}

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;

    this.userService.sendPasswordResetToken(this.form.value.email).subscribe({
      next: (res: any) => {
        this.loading = false;
        const msg = res?.data?.message || res?.message || res?.Message
          || this.t.instant('Auth.Forgot.Success');
        this.notify.success(msg, 3000);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.Message || err?.error?.message
          || this.t.instant('Auth.Forgot.Fail');
        this.notify.error(msg, 4000);
      }
    });
  }
}
