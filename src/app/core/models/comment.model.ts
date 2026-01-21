export interface GetCommentDto {
  id: number;
  content: string;
  createdAt: string;
  postId: number;
  postTitle?: string;
  userId: number;
  userFullName?: string;
}

export interface CreateCommentDto {
  postId: number;
  content: string;
}

export interface UpdateCommentDto {
  id: number;
  content: string;
}