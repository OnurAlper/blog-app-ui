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
