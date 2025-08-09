import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/shared/notification.service';
import { TagService } from 'src/app/core/services/tag.service';
import { GetTagDto, CreateTagDto, UpdateTagDto } from 'src/app/core/models/tag.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss'],
  standalone: false
})
export class TagListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'actions'];
  dataSource = new MatTableDataSource<GetTagDto>([]);

  loading = false;

  searchTerm = '';
  orderBy: string = 'Name';
  orderDirection: 'asc' | 'desc' = 'asc';
  pageIndex = 0;
  pageSize = 10;
  totalCount = 0;

  private searchDebounce!: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly tagService: TagService,
    public readonly i18n: TranslateService,
    private readonly notify: NotificationService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  // Listeyi yükle
  load(): void {
    const pageNumber = this.pageIndex + 1;
    this.loading = true;

    this.tagService
      .getAllTags(pageNumber, this.pageSize, this.orderBy, this.orderDirection, this.searchTerm.trim() || undefined)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          // Id/Name büyük-küçük farkı olursa normalize et
          const items = (res.data || []).map((x: any) => ({
            id: x.id ?? x.Id,
            name: x.name ?? x.Name
          })) as GetTagDto[];

          this.dataSource.data = items;
          this.totalCount = res.totalPage ?? items.length;
        },
        error: (err) => {
          const backendMsg = err?.error?.Message || err?.error?.message;
          this.notify.error(backendMsg || this.i18n.instant('COMMON.ERROR'));
          this.dataSource.data = [];
          this.totalCount = 0;
        }
      });
  }

  // Arama input
  onSearchInput(value: string): void {
    this.searchTerm = value;
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.pageIndex = 0;
      this.load();
    }, 300);
  }

  // Arama butonu
  onSearch(): void {
    this.pageIndex = 0;
    this.load();
  }

  // Sıralama
  onSortChange(sort: Sort): void {
    const fieldMap: Record<string, string> = { id: 'Id', name: 'Name' };
    const selectedField = fieldMap[sort.active] || sort.active;

    if (this.orderBy === selectedField) {
      this.orderDirection = this.orderDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.orderBy = selectedField;
      this.orderDirection = 'asc';
    }

    this.load();
  }

  // Sayfa değişimi
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }

  // Create → /tags/create
  openCreate(): void {
    this.router.navigate(['/tags/create']);
  }

  // Edit → /tags/edit/:id
  openEdit(tag: GetTagDto): void {
    this.router.navigate(['/tags/edit', tag.id]);
  }

  // Sil
  remove(id: number): void {
    if (!confirm(this.i18n.instant('COMMON.CONFIRM_DELETE'))) return;

    this.loading = true;
    this.tagService
      .deleteTag(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          const backendMsg = (res as any)?.Message || (res as any)?.message;
          this.notify.success(backendMsg || this.i18n.instant('COMMON.DELETE_SUCCESS'));

          // son sayfada tek eleman silindiyse bir önceki sayfaya dön
          if (this.dataSource.data.length === 1 && this.pageIndex > 0) {
            this.pageIndex -= 1;
          }
          this.load();
        },
        error: (err) => {
          const backendMsg = err?.error?.Message || err?.error?.message;
          this.notify.error(backendMsg || this.i18n.instant('COMMON.DELETE_FAILED'));
        }
      });
  }
}
