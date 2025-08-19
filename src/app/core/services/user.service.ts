import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import {
  ChangePasswordDto,
  GetUserDto,
  LoginRequestDto,
  LoginResponseDto,
  PasswordResetConfirmDto,
  ReactivateUserRequestDto,
  SignupRequestDto,
  UpdateProfileDto
} from '../models/user.model';
import { BaseResponse } from '../models/base-response.model'; // ✅ ekle
import { CreateResponseDto, DeleteResponseDto, UpdateResponseDto } from '../models/general.model';

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
    verifyEmail(token: string): Observable<BaseResponse<UpdateResponseDto>> {
    return this.get<BaseResponse<UpdateResponseDto>>(`User/VerifyEmail?token=${token}`);
  }

  sendPasswordResetToken(email: string): Observable<BaseResponse<UpdateResponseDto>> {
    return this.post<BaseResponse<UpdateResponseDto>>(
      `User/SendPasswordResetToken?email=${encodeURIComponent(email)}`,
      null
    );
  }

  confirmPasswordReset(data: PasswordResetConfirmDto): Observable<BaseResponse<UpdateResponseDto>> {
    return this.post<BaseResponse<UpdateResponseDto>>('User/ConfirmPasswordReset', data);
  }
   getAllUsers(
    pageNumber: number,
    pageSize: number,
    options?: {
      orderByProperty?: string | null;
      ascending?: 'asc' | 'desc' | null;  // BE param adı 'ascending'
      searchTerm?: string | null;
      status?: string | null;
    }
  ): Observable<BaseResponse<GetUserDto[]>> {
    return this.get<BaseResponse<GetUserDto[]>>('User/GetAllUsers', {
      params: {
        pageNumber,
        pageSize,
        orderByProperty: options?.orderByProperty ?? 'Id',
        ascending: options?.ascending ?? 'asc',
        searchTerm: options?.searchTerm ?? '',
        status: options?.status ?? 'active'
      }
    });
  }

  // 🔥 Admin: Hesap sil (soft delete)
  // BE endpoint: DELETE User/DeleteAccount/{userId}
  deleteAccount(userId: number): Observable<BaseResponse<DeleteResponseDto>> {
    return this.delete<BaseResponse<DeleteResponseDto>>(`User/DeleteAccount/${userId}`);
  }

  // 🔥 Admin: Hesabı yeniden aktive et
  // BE endpoint: PUT User/ReactivateUser   body: { userId: number }
  reactivateUser(body: ReactivateUserRequestDto): Observable<BaseResponse<UpdateResponseDto>> {
    return this.put<BaseResponse<UpdateResponseDto>>('User/ReactivateUser', body);
  }
}
