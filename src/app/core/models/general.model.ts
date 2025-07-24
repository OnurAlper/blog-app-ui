// general.model.ts

export interface CreateResponseDto {
  id: number;
  message: string;
  isCreated: boolean;
}

export interface DeleteResponseDto {
  id: number;
  message: string;
  isDeleted: boolean;
}

export interface UpdateResponseDto {
  isUpdated: boolean;
  message: string;
  updatedEntityId?: number;
}
