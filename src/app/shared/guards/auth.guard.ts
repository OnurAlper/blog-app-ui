import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree, ActivatedRouteSnapshot } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    return this.checkAccess(route);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot): boolean | UrlTree {
    return this.checkAccess(childRoute);
  }

  private checkAccess(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const token = localStorage.getItem('token');
    if (!token) return this.router.parseUrl('/login');

    try {
      const decoded: any = jwtDecode(token);

      const roleMap: Record<number, string> = {
        1: 'Admin',
        2: 'Client'
      };
      const userRole = roleMap[decoded.roleId] || decoded.roleId;

      // Burada any[] veya string[] tipini zorla
      const allowedRoles = route.data['roles'] as (string | number)[] | undefined;

      if (
        allowedRoles &&
        !allowedRoles.includes(userRole) &&
        !allowedRoles.includes(decoded.roleId)
      ) {
        return this.router.parseUrl('/unauthorized');
      }

      return true;
    } catch {
      return this.router.parseUrl('/login');
    }
  }
}
