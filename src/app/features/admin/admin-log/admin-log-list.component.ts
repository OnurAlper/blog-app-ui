import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { AdminLogService } from 'src/app/core/services/admin-log.service';
import { NotificationService } from 'src/app/shared/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { GetAdminActionLogDto } from 'src/app/core/models/admin-log.model';

@Component({
  selector: 'app-admin-log-list',
  standalone: false,
  templateUrl: './admin-log-list.component.html',
  styleUrls: ['./admin-log-list.component.scss']
})
export class AdminLogListComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['adminFullName', 'action', 'timestamp'];
  dataSource = new MatTableDataSource<GetAdminActionLogDto>([]);

  loading = false;
  searchTerm = '';
  orderBy = 'Timestamp';
  direction: 'asc' | 'desc' = 'desc';

  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private adminLogService: AdminLogService,
    private notify: NotificationService,
    public i18n: TranslateService
  ) {}

  ngOnInit(): void {
    this.search$
      .pipe(debounceTime(350), takeUntil(this.destroy$))
      .subscribe(() => this.load());

    this.load();
  }

  load(): void {
    this.loading = true;
    this.adminLogService
      .getAll(this.searchTerm.trim() || undefined, this.orderBy, this.direction)
      .pipe(finalize(() => (this.loading = false)), takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const items = (res?.data as any as GetAdminActionLogDto[]) || [];
          this.dataSource.data = items;
        },
        error: (err) => {
          const msg = err?.error?.Message || err?.error?.message || this.i18n.instant('COMMON.ERROR');
          this.notify.error(msg);
          this.dataSource.data = [];
        }
      });
  }

  onSearchInput(value: string): void {
    this.searchTerm = value;
    this.search$.next(value);
  }

  onSortChange(sort: Sort): void {
    const fieldMap: Record<string, string> = {
      adminFullName: 'AdminFullName',
      action: 'Action',
      timestamp: 'Timestamp'
    };
    this.orderBy = fieldMap[sort.active] || 'Timestamp';
    this.direction = (sort.direction || 'desc') as 'asc' | 'desc';
    this.load();
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
