import { GenderType } from "./gender.enum";

export interface LoginRequestDto {
  usernameOrEmail: string;
  password: string;
  staySignedIn: boolean;
}

export interface LoginResponseDto {
  id: number;
  fullName: string;
  email: string;
  username: string;
  token: string;
  refreshToken?: string;
}

export interface SignupRequestDto {
  name: string;
  surname: string;
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  birthDate: Date;
  gender: GenderType;
  countryId: number;
}

export interface GetUserDto {
  id: number;

  // Kimlik Bilgileri
  name: string;
  surname: string;
  fullName: string; // Optional, backend computed olabilir

  // Giriş Bilgileri
  username: string;
  email: string;
  phoneNumber?: string;
  birthDate: string; // ISO formatta string gelmesi beklenir (örn. "2000-01-01T00:00:00")
  gender: GenderType;
  countryId: number;

  profileImageUrl?: string;
}

export interface UpdateProfileDto {
  name: string;
  surname: string;
  username: string;
  email: string;
  phoneNumber?: string;
  birthDate: string; // Angular'da Date ya da string olabilir
  gender: GenderType;
  countryId: number;
  profileImageUrl?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordResetConfirmDto
{
  token: string;
  newPassword: string;
  confirmPassword: string;
}