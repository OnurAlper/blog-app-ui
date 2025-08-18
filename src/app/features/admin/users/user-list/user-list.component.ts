// src/app/features/admin/users/user-list/user-list.component.ts
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Subject, debounceTime, takeUntil, startWith } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

import { UserService } from 'src/app/core/services/user.service';
import { CountryService } from 'src/app/core/services/country.service';
import { NotificationService } from 'src/app/shared/notification.service';
import { TranslateService } from '@ngx-translate/core';

import { GetUserDto } from 'src/app/core/models/user.model';
import { BaseResponse } from 'src/app/core/models/base-response.model';

type Row = GetUserDto & { _imgErr?: boolean };

@Component({
  selector: 'app-user-list',
  standalone: false,
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit, OnDestroy {
  // UI state
  viewMode: 'table' | 'card' = 'table';
  loading = false;
  showDeleted = false;

  // data
  dataSource = new MatTableDataSource<Row>([]);
  displayedColumns: string[] = ['user', 'email', 'phoneNumber', 'birthDate', 'gender', 'country', 'actions'];

  // paging/sorting (UI + BE ayrı)
  totalCount = 0;
  pageSize = 10;
  pageIndex = 0;

  // UI sort (MatSort header id’leri)
  sortActiveUi: 'user' | 'email' | 'birthDate' | 'gender' | 'country' | 'phoneNumber' = 'user';
  sortDirectionUi: 'asc' | 'desc' = 'asc';

  // BE sort paramları
  sortActive = 'Name';                 // varsayılan BE alanı
  sortDirection: 'asc' | 'desc' = 'asc';

  // search & filters
  searchTerm = '';
  private search$ = new Subject<string>();
  genderFilter: number | null = null;
  countryFilter: number | null = null;

  countries: { id: number; name: string }[] = [];
  filteredCountries: { id: number; name: string }[] = [];
  countriesMap: Record<number, string> = {};
  countryFilterCtrl = new FormControl<string>('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private countryService: CountryService,
    private notify: NotificationService,
    public t: TranslateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Ülkeler
    this.countryService.getAll().subscribe({
      next: (res: any) => {
        const list = res?.data || [];
        this.countries = list;
        this.filteredCountries = list;

        this.countriesMap = list.reduce((acc: Record<number, string>, c: any) => {
          acc[c.id] = c.name;
          return acc;
        }, {});

        // Ülke arama (select içindeki arama kutusu)
        this.countryFilterCtrl.valueChanges
          .pipe(startWith(''), debounceTime(200), takeUntil(this.destroy$))
          .subscribe(term => {
            const q = (term || '').toLowerCase().trim();
            this.filteredCountries = !q
              ? this.countries
              : this.countries.filter(c => (c.name || '').toLowerCase().includes(q));
          });
      },
      error: () => this.notify.error(this.t.instant('PROFILE.COUNTRY_FETCH_ERROR')),
    });

    // aramayı debounce et
    this.search$
      .pipe(debounceTime(400), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageIndex = 0;
        this.refresh();
      });

    // ilk yükleme
    this.refresh();
  }

  // --- Data yükleme ---
  refresh(): void {
    this.loading = true;

    const pageNumber = this.pageIndex + 1;
    const pageSize = this.pageSize;

    this.userService
      .getAllUsers(pageNumber, pageSize, {
        orderByProperty: this.sortActive,
        // ÖNEMLİ: ascending boolean olmalı
       ascending: this.sortDirection, // ✔ 'asc' | 'desc'
        searchTerm: this.searchTerm?.trim() || '',
        // backend destekliyorsa gender/country filtreleri buraya da eklenebilir
      })
      .pipe(finalize(() => (this.loading = false)), takeUntil(this.destroy$))
      .subscribe({
        next: (res: BaseResponse<GetUserDto[]>) => {
          const rows = (res?.data || []).map(r => ({ ...r })) as Row[];

          // (Şimdilik) client-side filtre
          const filtered = rows.filter(u => {
            let ok = true;
            if (this.genderFilter) ok = ok && u.gender === this.genderFilter;
            if (this.countryFilter) ok = ok && u.countryId === this.countryFilter;
            return ok;
          });

          this.dataSource.data = filtered;

          // totalCount güvenli atama
          this.totalCount = (res as any)?.totalCount ?? (res as any)?.totalPage ?? filtered.length;
        },
        error: (err: any) => {
          const msg = err?.error?.Message || err?.error?.message || this.t.instant('COMMON.ERROR');
          this.notify.error(msg);
          this.dataSource.data = [];
          this.totalCount = 0;
        },
      });
  }

  // --- UI Handlers ---
  onSearchInput(value: string): void {
    this.searchTerm = value || '';
    this.search$.next(this.searchTerm);
  }

  onSearch(): void {
    this.pageIndex = 0;
    this.refresh();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.pageIndex = 0;
    this.refresh();
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.refresh();
  }

  onPageChange(e: PageEvent): void {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.refresh();
  }

  onSortChange(e: Sort): void {
    // UI kolon -> BE alan map’i
    const map: Record<string, string> = {
      user: 'Name',
      email: 'Email',
      birthDate: 'BirthDate',
      gender: 'Gender',
      country: 'CountryId',
      phoneNumber: 'PhoneNumber',
    };

    // UI state’i güncelle
    this.sortActiveUi = (e.active as any) || 'user';
    const uiDir = (e.direction && (e.direction as 'asc' | 'desc')) || 'asc';
    this.sortDirectionUi = uiDir;

    // BE state’i güncelle
    this.sortActive = map[this.sortActiveUi] || 'Name';
    this.sortDirection = uiDir;

    // sayfayı başa al ve yükle
    this.pageIndex = 0;
    this.refresh();
  }

  toggleDeleted(): void {
    // Şimdilik BE’de silinmişleri listeleyecek endpoint yok.
    if (this.showDeleted) {
      this.notify.info(this.t.instant('USERS.DELETED_LIST_NOT_AVAILABLE'));
      this.showDeleted = false;
    }
    this.pageIndex = 0;
    this.refresh();
  }

  onImgError(u: Row): void {
    u._imgErr = true;
  }

  // --- Actions ---
  openProfile(userId: number): void {
    this.notify.info(this.t.instant('USERS.OPEN_PROFILE_INFO'));
    // this.router.navigate(['/profile', userId]);
  }

  remove(userId: number): void {
    const ok = confirm(this.t.instant('PROFILE.CONFIRM_DELETE'));
    if (!ok) return;

    this.loading = true;
    this.userService.deleteAccount(userId)
      .pipe(finalize(() => (this.loading = false)), takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const msg = (res as any)?.message || this.t.instant('PROFILE.DELETE_SUCCESS');
          this.notify.success(msg);
          this.refresh();
        },
        error: (err: any) => {
          const msg = err?.error?.Message || err?.error?.message || this.t.instant('PROFILE.DELETE_FAILED');
          this.notify.error(msg);
        },
      });
  }

  reactivate(userId: number): void {
    this.loading = true;
    this.userService.reactivateUser({ userId })
      .pipe(finalize(() => (this.loading = false)), takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const msg = (res as any)?.message || this.t.instant('USERS.REACTIVATE_SUCCESS');
          this.notify.success(msg);
          this.refresh();
        },
        error: (err: any) => {
          const msg = err?.error?.Message || err?.error?.message || this.t.instant('USERS.REACTIVATE_FAIL');
          this.notify.error(msg);
        },
      });
  }

  exportCsv(): void {
    const rows = this.dataSource.data || [];
    if (!rows.length) return;

    const headers = ['Id', 'Name', 'Surname', 'Username', 'Email', 'Phone', 'BirthDate', 'Gender', 'CountryId'];
    const lines = rows.map(u => [
      u.id,
      safe(u.name),
      safe(u.surname),
      safe(u.username),
      safe(u.email),
      safe(u.phoneNumber || ''),
      new Date(u.birthDate).toISOString().slice(0, 10),
      u.gender,
      u.countryId,
    ].join(','));

    const csv = [headers.join(','), ...lines].join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `users_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    function safe(s: string) {
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
