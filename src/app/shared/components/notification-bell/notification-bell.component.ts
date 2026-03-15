import {
  Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationApiService } from 'src/app/core/services/notification-api.service';
import { SignalRService } from 'src/app/core/services/signalr.service';
import { GetNotificationDto } from 'src/app/core/models/notification.model';

@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss'],
  standalone: false
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notifications: GetNotificationDto[] = [];
  unreadCount = 0;
  open = false;
  loading = false;

  panelTop = '0px';
  panelRight = '0px';

  @ViewChild('bellBtn') bellBtnRef!: ElementRef<HTMLElement>;

  private sub = new Subscription();

  constructor(
    private api: NotificationApiService,
    private signalR: SignalRService,
    private elRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.loadNotifications();

    // Gerçek zamanlı bildirim geldiğinde listeyi güncelle
    this.sub.add(
      this.signalR.newNotification$.subscribe(payload => {
        const fake: GetNotificationDto = {
          id: Date.now(),           // geçici id, liste yenilenince gerçeğiyle değişir
          message: payload.message,
          isRead: false,
          createdAt: payload.createdAt,
          userId: 0
        };
        this.notifications = [fake, ...this.notifications];
        this.unreadCount++;
      })
    );
  }

  loadNotifications(): void {
    this.loading = true;
    this.api.getAll(1, 20).subscribe({
      next: res => {
        this.notifications = res.data ?? [];
        this.unreadCount = this.notifications.filter(n => !n.isRead).length;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  togglePanel(): void {
    this.open = !this.open;
    if (this.open && this.bellBtnRef) {
      const rect = this.bellBtnRef.nativeElement.getBoundingClientRect();
      this.panelTop = `${rect.bottom + 8}px`;
      this.panelRight = `${window.innerWidth - rect.right}px`;
    }
  }

  markAsRead(notification: GetNotificationDto, event: Event): void {
    event.stopPropagation();
    if (notification.isRead) return;

    this.api.markAsRead(notification.id).subscribe({
      next: () => {
        notification.isRead = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    });
  }

  markAllAsRead(): void {
    const unread = this.notifications.filter(n => !n.isRead);
    unread.forEach(n => {
      this.api.markAsRead(n.id).subscribe({
        next: () => { n.isRead = true; }
      });
    });
    this.unreadCount = 0;
  }

  // Panel dışına tıklanınca kapat
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.open = false;
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  timeAgo(dateStr: string): string {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Az önce';
    if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
    return `${Math.floor(diff / 86400)} gün önce`;
  }
}
