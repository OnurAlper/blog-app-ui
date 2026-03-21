import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { BlogService } from 'src/app/core/services/blog.service';
import { CommentService } from 'src/app/core/services/comment.service';
import { PostLikeService } from 'src/app/core/services/post-like.service';
import { BlogViewService } from 'src/app/core/services/blog-view.service';
import { NotificationService } from 'src/app/shared/notification.service';
import { AuthService } from 'src/app/core/services/auth.service';

import { GetBlogPostDto } from 'src/app/core/models/blog.model';
import { GetCommentDto } from 'src/app/core/models/comment.model';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss'],
  standalone: false
})
export class BlogDetailComponent implements OnInit, OnDestroy {
  blog: GetBlogPostDto | null = null;
  comments: GetCommentDto[] = [];
  commentTotal = 0;
  commentPage = 0;
  commentPageSize = 10;

  loading = false;
  commentsLoading = false;
  commentSubmitting = false;

  liked = false;
  liking = false;

  commentForm: FormGroup;
  replyForm: FormGroup;
  replyingToId: number | null = null;
  replySubmitting = false;

  currentUserId: number | null = null;

  private sub = new Subscription();
  currentYear = new Date().getFullYear();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly blogService: BlogService,
    private readonly commentService: CommentService,
    private readonly postLikeService: PostLikeService,
    private readonly blogViewService: BlogViewService,
    private readonly notify: NotificationService,
    private readonly authService: AuthService
  ) {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(2)]]
    });
    this.replyForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserId = user?.id ?? null;

    this.sub.add(
      this.route.paramMap.subscribe(params => {
        const id = Number(params.get('id'));
        if (id) this.loadBlog(id);
      })
    );
  }

  loadBlog(id: number): void {
    this.loading = true;
    this.blogService.getById(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          this.blog = res.data as GetBlogPostDto;
          this.liked = this.blog.isLikedByCurrentUser ?? false;
          // Görüntülenme kaydet ve sayacı güncelle
          this.blogViewService.trackView(id).subscribe({
            next: () => { if (this.blog) this.blog.viewCount++; },
            error: () => {}
          });
          this.loadComments();
        },
        error: () => {
          this.notify.error('Blog yüklenirken hata oluştu.');
          this.router.navigate(['/client/blogs']);
        }
      });
  }

  loadComments(): void {
    if (!this.blog) return;
    this.commentsLoading = true;
    this.commentService.getAllComments(
      this.commentPage + 1,
      this.commentPageSize,
      'CreatedAt',
      'desc',
      undefined,
      this.blog.id
    )
      .pipe(finalize(() => (this.commentsLoading = false)))
      .subscribe({
        next: (res: any) => {
          this.comments = (res.data || []) as GetCommentDto[];
          this.commentTotal = res.totalPage ?? this.comments.length;
        },
        error: () => { this.comments = []; }
      });
  }

  toggleLike(): void {
    if (!this.blog || this.liking) return;
    this.liking = true;

    if (this.liked) {
      this.postLikeService.unlikePost(this.blog.id).subscribe({
        next: () => {
          this.liked = false;
          this.blog!.likeCount = Math.max(0, this.blog!.likeCount - 1);
          this.liking = false;
        },
        error: () => { this.liking = false; }
      });
    } else {
      this.postLikeService.likePost(this.blog.id).subscribe({
        next: () => {
          this.liked = true;
          this.blog!.likeCount++;
          this.liking = false;
        },
        error: (err: any) => {
          this.liking = false;
          const msg = err?.error?.Message || err?.error?.message;
          if (msg) this.notify.error(msg);
        }
      });
    }
  }

  submitComment(): void {
    if (this.commentForm.invalid || !this.blog || this.commentSubmitting) return;
    this.commentSubmitting = true;

    this.commentService.createComment({
      postId: this.blog.id,
      content: this.commentForm.value.content
    })
      .pipe(finalize(() => (this.commentSubmitting = false)))
      .subscribe({
        next: () => {
          this.commentForm.reset();
          this.commentPage = 0;
          this.loadComments();
        },
        error: (err: any) => {
          const msg = err?.error?.Message || err?.error?.message;
          this.notify.error(msg || 'Yorum gönderilirken hata oluştu.');
        }
      });
  }

  deleteComment(commentId: number): void {
    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== commentId);
        this.commentTotal = Math.max(0, this.commentTotal - 1);
      },
      error: (err: any) => {
        const msg = err?.error?.Message || err?.error?.message;
        this.notify.error(msg || 'Yorum silinirken hata oluştu.');
      }
    });
  }

  onCommentPageChange(event: any): void {
    this.commentPage = event.pageIndex;
    this.commentPageSize = event.pageSize;
    this.loadComments();
  }

  openReply(commentId: number): void {
    this.replyingToId = this.replyingToId === commentId ? null : commentId;
    this.replyForm.reset();
  }

  cancelReply(): void {
    this.replyingToId = null;
    this.replyForm.reset();
  }

  submitReply(): void {
    if (this.replyForm.invalid || !this.blog || !this.replyingToId || this.replySubmitting) return;
    this.replySubmitting = true;

    this.commentService.createComment({
      postId: this.blog.id,
      content: this.replyForm.value.content,
      parentId: this.replyingToId
    })
      .pipe(finalize(() => (this.replySubmitting = false)))
      .subscribe({
        next: () => {
          this.replyForm.reset();
          this.replyingToId = null;
          this.loadComments();
        },
        error: (err: any) => {
          const msg = err?.error?.Message || err?.error?.message;
          this.notify.error(msg || 'Yanıt gönderilemedi.');
        }
      });
  }

  deleteReply(replyId: number, parentId: number): void {
    this.commentService.deleteComment(replyId).subscribe({
      next: () => {
        const parent = this.comments.find(c => c.id === parentId);
        if (parent?.replies) {
          parent.replies = parent.replies.filter(r => r.id !== replyId);
        }
      },
      error: (err: any) => {
        const msg = err?.error?.Message || err?.error?.message;
        this.notify.error(msg || 'Yanıt silinemedi.');
      }
    });
  }

  scrollToComments(): void {
    document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  goBack(): void {
    this.router.navigate(['/client/blogs']);
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  getDefaultImage(): string {
    return 'assets/images/default-blog.jpg';
  }

  isMyComment(comment: GetCommentDto): boolean {
    if (this.currentUserId == null) return false;
    return comment.userId === this.currentUserId || this.authService.isAdmin();
  }

  shareUrl(platform?: string): void {
    const url = window.location.href;
    if (platform === 'copy' || !platform) {
      navigator.clipboard?.writeText(url).then(() => {
        this.notify.success('Bağlantı kopyalandı!');
      }).catch(() => {});
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
