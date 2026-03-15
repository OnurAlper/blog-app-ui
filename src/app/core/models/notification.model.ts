export interface GetNotificationDto {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
  userId: number;
  userFullName?: string;
}

export interface NewPostNotificationPayload {
  blogPostId: number;
  title: string;
  author: string;
  message: string;
  createdAt: string;
}
