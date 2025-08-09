// src/app/models/tag.model.ts

export interface GetTagDto {
  id: number;
  name: string;
}

export interface CreateTagDto {
  name: string;
}

export interface UpdateTagDto {
  id: number;
  name: string;
}
