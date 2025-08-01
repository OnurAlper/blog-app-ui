
// Backend: Business.DTOs.BlogPost.GetBlogPostDto
export interface GetBlogPostDto {
  id: number;
  title: string;
  content: string;
  coverImageUrl?: string | null;
  createdAt: string;       // ISO string
  isPublished: boolean;

  authorId: number;
  authorFullName: string;

  categoryId?: number | null;
  categoryName?: string | null;
}

// Backend: Business.DTOs.BlogPost.CreateBlogPostDto
export interface CreateBlogPostDto {
  title: string;
  content: string;
  coverImageUrl?: string | null;
  categoryId?: number | null;
}

// Backend: Business.DTOs.BlogPost.UpdateBlogPostDto
export interface UpdateBlogPostDto {
  id: number;
  title: string;
  content: string;
  coverImageUrl?: string | null;
  isPublished: boolean;
  categoryId?: number | null;
}
