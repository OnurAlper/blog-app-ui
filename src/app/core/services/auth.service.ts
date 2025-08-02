import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'token';
  private refreshTokenKey = 'refreshToken';

  constructor(private router: Router) {}

  // Access token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  setRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  // Giriş yapıldığında çağırılabilir
  setTokens(token: string, refreshToken: string): void {
    this.setToken(token);
    this.setRefreshToken(refreshToken);
  }

  // Tüm tokenleri temizle
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

 getCurrentUser(): any {
  const token = this.getToken();
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}
getCurrentUserRole(): string | null {
  const user = this.getCurrentUser();
  return user?.roleId || null; 
}

isAdmin(): boolean {
  return this.getCurrentUserRole() === 'Admin';
}

isClient(): boolean {
  return this.getCurrentUserRole() === 'Client';
}


}
