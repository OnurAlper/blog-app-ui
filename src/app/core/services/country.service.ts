import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

import { BaseApiService } from './base-api.service';
import { BaseResponse } from '../models/base-response.model';
import { GetCountryDto } from '../models/country.model';

@Injectable({
  providedIn: 'root'
})
export class CountryService extends BaseApiService {

  getAll(
    searchTerm: string = '',
    orderBy: string = 'Name',
    orderDirection: string = 'asc'
  ): Observable<BaseResponse<GetCountryDto[]>> {
    let params = new HttpParams()
      .set('orderBy', orderBy)
      .set('orderDirection', orderDirection);

    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    return this.get<BaseResponse<GetCountryDto[]>>('Countries/GetCountries', { params });
  }
}
