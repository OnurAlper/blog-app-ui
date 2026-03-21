export interface GetAdminActionLogDto {
  id: number;
  adminId: number;
  adminFullName: string;
  action: string;
  timestamp: string;
}
