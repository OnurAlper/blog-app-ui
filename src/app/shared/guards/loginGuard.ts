import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const now = Math.floor(Date.now() / 1000);

        if (decoded.exp && decoded.exp > now) {
          // Token hâlâ geçerli → login/signup sayfalarına erişmesin
          this.router.navigate(['/dashboard']);
          return false;
        }
      } catch {
        // Token bozuksa → erişime izin ver
        return true;
      }
    }

    return true; // Token yoksa erişime izin ver
  }
}
