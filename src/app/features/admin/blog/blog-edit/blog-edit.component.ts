import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin, Subscription } from 'rxjs';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { TranslateService } from '@ngx-translate/core';

import { GetBlogPostDto, UpdateBlogPostDto } from 'src/app/core/models/blog.model';
import { BlogService } from 'src/app/core/services/blog.service';
import { CategoryService } from 'src/app/core/services/category.service';
import { TagService } from 'src/app/core/services/tag.service';
import { GetCategoryDto } from 'src/app/core/models/category.model';
import { GetTagDto } from 'src/app/core/models/tag.model';
import { NotificationService } from 'src/app/shared/notification.service';

@Component({
  selector: 'app-blog-edit',
  templateUrl: './blog-edit.component.html',
  styleUrls: ['./blog-edit.component.scss'],
  standalone: false
})
export class BlogEditComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  postId!: number;

  saving = false;

  coverPreview: string | null = null;
  selectedCoverFile: File | null = null;

  categories: GetCategoryDto[] = [];
  tags: GetTagDto[] = [];

  selectedCategoryName = '';
  selectedTagNames: string[] = [];

  private subs = new Subscription();

  // 🔹 Guard bu getter'ı okuyacak
  get hasUnsavedChanges(): boolean {
    return !!this.form && this.form.dirty && !this.saving;
  }

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private categoryService: CategoryService,
    private tagService: TagService,
    private route: ActivatedRoute,
    private router: Router,
    private i18n: TranslateService,
    private notify: NotificationService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      categoryId: [null],
      tagIds: [[] as number[]],
      isPublished: [false]
    });

    this.postId = Number(this.route.snapshot.paramMap.get('id'));

    // valueChanges: meta’yı güncelle, (dirty kontrolünü getter yapıyor)
    this.subs.add(this.form.valueChanges.subscribe(() => this.updateSelectedMeta()));

    this.loadData();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // 💡 Sekme kapatma/yenileme uyarısı
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(e: BeforeUnloadEvent) {
    if (this.hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = this.i18n.instant('COMMON.UNSAVED_CHANGES') || '';
    }
  }


  private loadData(): void {
    const categories$ = this.categoryService.getCategories();
    const tags$ = this.tagService.getAllTags(); // default paramlarla gelir
    const post$ = this.blogService.getById(this.postId);

    this.saving = false; // güvenlik
    this.subs.add(
      forkJoin([categories$, tags$, post$])
        .pipe()
        .subscribe({
          next: ([catRes, tagRes, postRes]) => {
            this.categories = catRes.data ?? [];
            this.tags = tagRes.data ?? [];

            const post: GetBlogPostDto = postRes.data;

            const tagIdsFromNames =
              (post.tags ?? [])
                .map(name =>
                  this.tags.find(t => t.name?.toLowerCase() === String(name).toLowerCase())?.id
                )
                .filter((id): id is number => !!id) || [];

            this.form.patchValue({
              title: post.title,
              content: post.content,
              categoryId: post.categoryId ?? null,
              tagIds: tagIdsFromNames,
              isPublished: post.isPublished
            });

            this.coverPreview = post.coverImageUrl || null;
            this.selectedCoverFile = null;

            // ilk yüklemeden sonra dirty olmasın
            this.form.markAsPristine();
            this.updateSelectedMeta();
          },
          error: (err) => {
            const backendMsg = err?.error?.Message || err?.error?.message;
            this.notify.error(backendMsg || this.i18n.instant('COMMON.ERROR'));
            this.router.navigate(['/blog']);
          }
        })
    );
  }


  private updateSelectedMeta(): void {
    const cid = this.form.get('categoryId')?.value as number | null;
    this.selectedCategoryName = cid
      ? (this.categories.find(c => c.id === cid)?.name || '')
      : '';

    const tagIds = (this.form.get('tagIds')?.value as number[]) || [];
    this.selectedTagNames = tagIds
      .map(id => this.tags.find(t => t.id === id)?.name)
      .filter((x): x is string => !!x);
  }

  onCoverImageChange(evt: Event): void {
    const input = evt.target as HTMLInputElement;
    const file = input?.files?.[0] ?? null;

    this.selectedCoverFile = file;

    if (file) {
      const reader = new FileReader();
      reader.onload = () => (this.coverPreview = reader.result as string);
      reader.readAsDataURL(file);
    } else {
      this.coverPreview = null;
    }

    this.form.markAsDirty();
  }

  clearCoverImage(): void {
    this.selectedCoverFile = null;
    this.coverPreview = null;
    this.form.markAsDirty();
  }

  onPublishToggle(ev: MatSlideToggleChange): void {
    this.form.patchValue({ isPublished: ev.checked });
    this.form.markAsDirty();
  }

  save(): void {
    if (this.form.invalid || this.saving) return;

    const val = this.form.value;
    const dto: UpdateBlogPostDto = {
      id: this.postId,
      title: val.title,
      content: val.content,
      categoryId: val.categoryId ?? null,
      isPublished: !!val.isPublished,
      tagIds: (val.tagIds as number[]) || [],
      coverImage: this.selectedCoverFile ?? undefined
    };

    this.saving = true;
    this.subs.add(
      this.blogService.update(dto)
        .pipe(finalize(() => (this.saving = false)))
        .subscribe({
          next: (res: any) => {
            const backendMsg = res?.Message || res?.message;
            this.notify.success(backendMsg || this.i18n.instant('COMMON.UPDATE_SUCCESS'));
            this.form.markAsPristine(); // unsaved uyarısı kalmasın
            this.router.navigate(['/blog']);
          },
          error: (err) => {
            const backendMsg = err?.error?.Message || err?.error?.message;
            this.notify.error(backendMsg || this.i18n.instant('COMMON.UPDATE_FAILED'));
          }
        })
    );
  }


  trackById(_: number, item: { id: number }): number {
    return item.id;
  }
}
