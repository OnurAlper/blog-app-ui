import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PageableService {
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  pages: number[] = [];

  /** 1–10 gibi başlangıç */
  get rangeStart(): number {
    if (this.totalCount === 0) return 0;
    return (this.pageNumber - 1) * this.pageSize + 1;
  }

  /** 1–10 gibi bitiş */
  get rangeEnd(): number {
    const end = this.pageNumber * this.pageSize;
    return Math.min(end, this.totalCount);
  }

  /** Sayfa numaralarını oluştur */
  buildPages(windowSize: number = 7): void {
    const total = this.totalPages || 0;
    const current = this.pageNumber;
    if (!total) { this.pages = []; return; }

    let start = Math.max(1, current - Math.floor(windowSize / 2));
    let end = Math.min(total, start + windowSize - 1);
    if (end - start + 1 < windowSize) {
      start = Math.max(1, end - windowSize + 1);
    }
    this.pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  /** Toplam veriye göre totalPages hesapla */
  updateTotal(totalCount: number): void {
    this.totalCount = totalCount;
    this.totalPages = Math.max(1, Math.ceil(this.totalCount / this.pageSize));
    this.buildPages();
  }

  /** Sayfaları değiştirme metodları */
  setPage(p: number): void { if (p !== this.pageNumber) this.pageNumber = p; }
  goFirst(): void { this.pageNumber = 1; }
  goLast(): void { this.pageNumber = this.totalPages; }
  goPrev(): void { if (this.pageNumber > 1) this.pageNumber--; }
  goNext(): void { if (this.pageNumber < this.totalPages) this.pageNumber++; }
}
