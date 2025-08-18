// src/app/features/auth/verify/verify.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from 'src/app/shared/notification.service';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss'],
  standalone: false
})
export class VerifyComponent implements OnInit {
  loading = true;
  verified = false;
  errorMsg: string = ""
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private notify: NotificationService,
    private t: TranslateService
  ) {}

  ngOnInit(): void {
    // query paramı güvenli şekilde al
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.loading = false;
      this.errorMsg = this.t.instant('Auth.Verify.InvalidLink');
      this.notify.error(this.errorMsg);
      return;
    }

    // Burada artık token kesinlikle string, null olamaz
    this.userService.verifyEmail(token).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.verified = true;

        const backendMsg = res?.Message || res?.message;
        const msg = backendMsg || this.t.instant('Auth.Verify.Success');
        this.notify.success(msg, 2500);

        // 2 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          this.router.navigateByUrl('/login');
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.verified = false;

        const backendMsg = err?.error?.Message || err?.error?.message;
        this.errorMsg = backendMsg || this.t.instant('Auth.Verify.Fail');
        this.notify.error(this.errorMsg, 3500);
      }
    });
  }
}
