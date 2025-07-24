import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BaseApiService {
  private baseUrl = 'http://localhost:5130/api'; // Global backend URL

  constructor(protected http: HttpClient) {}

  get<T>(url: string, options: {
    params?: HttpParams,
    headers?: { [key: string]: string }
  } = {}): Observable<T> {
    const defaultHeaders = new HttpHeaders({
      'accept-language': localStorage.getItem('language') || 'tr-TR',
      ...options.headers
    });

    return this.http.get<T>(`${this.baseUrl}/${url}`, {
      params: options.params,
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
