import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { SiteSettings } from '../models/site-settings.model';

@Injectable({ providedIn: 'root' })
export class SiteSettingsService extends BaseApiService {
  private readonly endpoint = 'SiteSettings';

  getSettings(): Observable<SiteSettings> {
    return this.get<SiteSettings>(this.endpoint);
  }

  updateSettings(dto: SiteSettings): Observable<any> {
    return this.put<any>(this.endpoint, dto);
  }
}
