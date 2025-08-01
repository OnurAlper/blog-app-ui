// models/base-response.model.ts
export interface BaseResponse<T> {
  statusCode: number;
  message: string;
  data: T;              // Tekil için T, liste için T[] kullan
  totalPage?: number;   // Sayfalı uçlarda gelir
  isSuccessful?: boolean; // BE göndermiyor, bu yüzden opsiyonel
}

// Kolaylık tipleri (opsiyonel)
export type ListResponse<T> = BaseResponse<T[]>;
export interface PagedResponse<T> extends BaseResponse<T[]> {
  totalPage: number;
}
