import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
  const token = localStorage.getItem('token');

  if (!token) {
    return this.router.parseUrl('/login');
  }

  try {
    const decoded: any = jwtDecode(token);

    // ❌ BURAYI SİL → interceptor zaten expired token'ı yenileyecek

    const allowedRoles = route.data['roles'] as Array<string | number> | undefined;

    if (allowedRoles && !allowedRoles.includes(decoded.roleId)) {
      return this.router.parseUrl('/unauthorized');
    }

    return true;
  } catch {
    return this.router.parseUrl('/login');
  }
}
}
