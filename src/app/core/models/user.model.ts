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
