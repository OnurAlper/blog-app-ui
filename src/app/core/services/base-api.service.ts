// services/base-api.service.ts
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

type QueryObject = Record<string, string | number | boolean | null | undefined>;

@Injectable({ providedIn: 'root' })
export class BaseApiService {
  private baseUrl = 'http://localhost:5130/api'; // Global backend URL

  constructor(protected http: HttpClient) {}

  // Düz obje -> HttpParams çevirici
  protected toHttpParams(query?: QueryObject): HttpParams {
    let params = new HttpParams();
    if (!query) return params;

    Object.entries(query).forEach(([key, value]) => {
      if (value !== null && value !== undefined && `${value}` !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }

  get<T>(
    url: string,
    options: {
      params?: HttpParams | QueryObject,
      headers?: { [key: string]: string }
    } = {}
  ): Observable<T> {
    const defaultHeaders = new HttpHeaders({
      'accept-language': localStorage.getItem('language') || 'tr-TR',
      ...options.headers
    });

    const params =
      options.params instanceof HttpParams
        ? options.params
        : this.toHttpParams(options.params as QueryObject);

    return this.http.get<T>(`${this.baseUrl}/${url}`, {
      params,
      headers: defaultHeaders
    });
  }

  post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${url}`, body, {
      headers: {
        'accept-language': localStorage.getItem('language') || 'tr-TR'
      }
    });
  }

  put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${url}`, body, {
      headers: {
        'accept-language': localStorage.getItem('language') || 'tr-TR'
      }
    });
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${url}`, {
      headers: {
        'accept-language': localStorage.getItem('language') || 'tr-TR'
      }
    });
  }
}
