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
        jwtDecode(token); // sadece token varsa ve çözümlenebiliyorsa yeter

        // Token varsa → login/signup sayfasına giremesin
        this.router.navigate(['/dashboard']);
        return false;
      } catch {
        // Token bozuksa → login sayfasına erişebilir
        return true;
      }
    }

    return true; // Token yoksa → login sayfasına erişebilir
  }
}
