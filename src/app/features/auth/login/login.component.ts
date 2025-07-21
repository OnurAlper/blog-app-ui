import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/services/user.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar 
  ) {
    // Form oluşturuluyor
    this.loginForm = this.fb.group({
      usernameOrEmail: ['', Validators.required],
      password: ['', Validators.required],
      staySignedIn: [false]
    });
  }

onSubmit() {
  if (this.loginForm.invalid) return;
  this.loading = true;

  this.userService.login(this.loginForm.value).subscribe({
    next: (res) => {
      localStorage.setItem('token', res.token);
      this.snackBar.open('Giriş başarılı!', 'Kapat', {
        duration: 3000,
        panelClass: ['snackbar-success']
      });
      this.router.navigate(['/dashboard']);
    },
    error: (err) => {
      const msg = err?.error?.message || 'Giriş başarısız';
      this.snackBar.open(msg, 'Kapat', {
        duration: 4000,
        panelClass: ['snackbar-error']
      });
      this.loading = false;
    },
    complete: () => {
      this.loading = false;
    }
  });
}

}
