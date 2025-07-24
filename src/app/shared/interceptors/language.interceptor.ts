import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class LanguageInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const langMap: { [key: string]: string } = {
      tr: 'tr-TR',
      en: 'en-US'
    };

    const storedLang = localStorage.getItem('language') || 'tr';
    const acceptLanguage = langMap[storedLang] || 'tr-TR';

    const cloned = req.clone({
      setHeaders: {
        'accept-language': acceptLanguage
      }
    });

    return next.handle(cloned);
  }
}
