export interface Banner {
  id: number;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  buttonText: string;
  imageUrl?: string | null;
  gradientColor1: string;
  gradientColor2: string;
  gradientAngle: number;
  orderIndex: number;
  isActive: boolean;
}

export interface CreateBannerDto {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  buttonText: string;
  imageUrl?: string | null;
  gradientColor1: string;
  gradientColor2: string;
  gradientAngle: number;
  orderIndex: number;
  isActive: boolean;
}

export interface UpdateBannerDto extends CreateBannerDto {
  id: number;
}
