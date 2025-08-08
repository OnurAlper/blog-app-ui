export interface DashboardData {
  stats: DashboardStats;
  monthlyTraffic: MonthlyTraffic[];
  postsByCategory: PostsByCategory[];
  publishStatus: PublishStatus[];
  monthlyUserRegistrations: MonthlyUser[];
  averageEngagementPerPost: number;
  topViewedPosts: TopPost[];
  topLikedPosts: TopPost[];
  topCommentedPosts: TopPost[];
  topAuthors: TopAuthor[];
}

export interface DashboardStats {
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  totalViews: number;
}

export interface MonthlyTraffic {
  month: string; // "01/2025"
  visitCount: number;
}

export interface PostsByCategory {
  categoryName: string;
  postCount: number;
}

export interface PublishStatus {
  status: string; // "Published" | "Draft"
  count: number;
}

export interface MonthlyUser {
  month: string; // "01/2025"
  userCount: number;
}

export interface TopPost {
  title: string;
  count: number;
}

export interface TopAuthor {
  authorName: string;
  postCount: number;
}
