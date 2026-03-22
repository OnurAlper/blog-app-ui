export interface ForumCategory {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  orderIndex: number;
  threadCount: number;
  createdAt: string;
}

export interface ForumThread {
  id: number;
  title: string;
  contentPreview: string;
  userId: number;
  userFullName: string;
  categoryId: number;
  categoryName: string;
  createdAt: string;
  updatedAt?: string;
  isLocked: boolean;
  isPinned: boolean;
  isAnnouncement: boolean;
  isFlagged: boolean;
  viewCount: number;
  postCount: number;
}

export interface ForumThreadDetail {
  id: number;
  title: string;
  content: string;
  userId: number;
  userFullName: string;
  userProfileImageUrl?: string;
  categoryId: number;
  categoryName: string;
  createdAt: string;
  updatedAt?: string;
  isLocked: boolean;
  isPinned: boolean;
  isAnnouncement: boolean;
  isFlagged: boolean;
  flagReason?: string;
  viewCount: number;
  totalPosts: number;
  posts: ForumPost[];
}

export interface ForumPost {
  id: number;
  content: string;
  threadId: number;
  userId: number;
  userFullName: string;
  userProfileImageUrl?: string;
  createdAt: string;
  updatedAt?: string;
  isFlagged: boolean;
  flagReason?: string;
}

export interface ForumBan {
  id: number;
  userId: number;
  userFullName: string;
  bannedByFullName: string;
  reason: string;
  bannedAt: string;
  expiresAt?: string;
  isActive: boolean;
  isPermanent: boolean;
}
