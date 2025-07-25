import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import {
  ChangePasswordDto,
  GetUserDto,
  LoginRequestDto,
  LoginResponseDto,
  SignupRequestDto,
  UpdateProfileDto
} from '../models/user.model';
import { BaseResponse } from '../models/base-response.model'; // ✅ ekle
import { CreateResponseDto, UpdateResponseDto } from '../models/general.model';

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
  getById(userId: number): Observable<BaseResponse<GetUserDto>> {
    return this.get<BaseResponse<GetUserDto>>(`User/GetById/${userId}`);
  }
  
  updateProfile(data: UpdateProfileDto): Observable<BaseResponse<UpdateResponseDto>> {
    return this.put<BaseResponse<UpdateResponseDto>>('User/UpdateProfile', data);
  }
 changePassword(data: ChangePasswordDto): Observable<BaseResponse<UpdateResponseDto>> {
    return this.put<BaseResponse<UpdateResponseDto>>('User/ChangePassword', data);
  }
}
