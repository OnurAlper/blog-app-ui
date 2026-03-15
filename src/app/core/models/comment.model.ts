export interface GetCommentDto {
  id: number;
  content: string;
  createdAt: string;
  postId: number;
  postTitle?: string;
  userId: number;
  userFullName?: string;
  parentId?: number | null;
  replies?: GetCommentDto[];
}

export interface CreateCommentDto {
  postId: number;
  content: string;
  parentId?: number | null;
}

export interface UpdateCommentDto {
  id: number;
  content: string;
}