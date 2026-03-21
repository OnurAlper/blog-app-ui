
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

  commentCount: number;
  likeCount: number;
  viewCount: number;
  tags: string[]; // ✅ burası
  estimatedReadMinutes: number;
  isLikedByCurrentUser?: boolean;
}

// Backend: Business.DTOs.BlogPost.CreateBlogPostDto
export interface CreateBlogPostDto {
  title: string;
  content: string;
  coverImage?: File | null; // FormData ile dosya göndermek için File tipi
  categoryId?: number | null;
  tagIds?: number[]; // 📌 Etiket ID listesi
}


// Backend: Business.DTOs.BlogPost.UpdateBlogPostDto

export interface UpdateBlogPostDto {
  id: number;
  title: string;
  content: string;
  isPublished: boolean;
  categoryId?: number | null;

  // yeni:
  coverImage?: File | null;   // form-data ile gönderilecek
  tagIds?: number[];          // seçilen etiket ID'leri
}

