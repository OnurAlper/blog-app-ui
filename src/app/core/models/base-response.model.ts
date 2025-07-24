export interface BaseResponse<T> {
  data: T;
  isSuccessful: boolean;
  message: string;
  statusCode: number;
  totalPage?: number;
}
