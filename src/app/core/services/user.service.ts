import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import {
  LoginRequestDto,
  LoginResponseDto,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseApiService {
  
  // Kullanıcı giriş
  login(data: LoginRequestDto): Observable<LoginResponseDto> {
    return this.post<LoginResponseDto>('User/Login', data);
  }
}
