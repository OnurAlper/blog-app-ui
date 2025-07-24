import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import {
  LoginRequestDto,
  LoginResponseDto,
  SignupRequestDto
} from '../models/user.model';
import { BaseResponse } from '../models/base-response.model'; // ✅ ekle
import { CreateResponseDto } from '../models/general.model';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseApiService {
  // Kullanıcı giriş
  login(data: LoginRequestDto): Observable<BaseResponse<LoginResponseDto>> {
    return this.post<BaseResponse<LoginResponseDto>>('User/Login', data);
  }
  signup(data: SignupRequestDto): Observable<BaseResponse<CreateResponseDto>> {
  return this.post<BaseResponse<CreateResponseDto>>('User/Signup', data);
}

}
