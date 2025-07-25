import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpResponse,
  HttpClient
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, switchMap, filter, take, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');

    let authReq = req;
    if (token) {
      authReq = this.addToken(req, token);
    }

    return next.handle(authReq).pipe(
      // 🔍 Response geldiğinde "isSuccessful = false" ise token expired olabilir
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse && event.body?.isSuccessful === false) {
          console.warn("⚠️ isSuccessful:false geldi, token bitmiş olabilir.");
          throw new Error('isSuccessful false');
        }
      }),
      catchError((error: HttpErrorResponse | Error) => {
        const isTokenExpired = error instanceof Error && error.message === 'isSuccessful false';
        const isUnauthorized = error instanceof HttpErrorResponse && error.status === 401;

        if (isTokenExpired || isUnauthorized) {
          console.log("🔁 Token yenileme başlatılıyor...");
          return this.handle401Error(authReq, next);
        }

        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const refreshToken = localStorage.getItem('refreshToken');

    // ⛔ Refresh token yoksa → otomatik logout
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('Oturum süresi doldu. Giriş yapmanız gerekiyor.'));
    }

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.http.post<any>('http://localhost:5130/api/User/RefreshToken', {
        refreshToken: refreshToken
      }).pipe(
        switchMap((response) => {
          this.isRefreshing = false;

          const newToken = response.data?.token;
          const newRefreshToken = response.data?.refreshToken;

          if (!newToken || !newRefreshToken) {
            this.logout();
            return throwError(() => new Error('Token yenileme başarısız.'));
          }

          // ✅ Token'ları güncelle
          localStorage.setItem('token', newToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          this.refreshTokenSubject.next(newToken);

          return next.handle(this.addToken(req, newToken));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.logout();
          return throwError(() => err);
        })
      );
    } else {
      // 🔁 Refresh token işlemi zaten başladıysa sıraya girsin
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((token) => next.handle(this.addToken(req, token!)))
      );
    }
  }

  private logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem("userId");
    this.router.navigate(['/login']);
  }
}
