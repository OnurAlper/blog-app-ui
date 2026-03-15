import { Injectable, OnDestroy } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { NewPostNotificationPayload } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class SignalRService implements OnDestroy {
  private hubConnection: signalR.HubConnection | null = null;
  private readonly HUB_URL = 'http://localhost:5130/hubs/notifications';

  /** Kişiye özel bildirim (notification bell için) */
  newNotification$ = new Subject<NewPostNotificationPayload>();

  /** Tüm clientlara yeni blog yazısı bilgisi (blog-list yenilemesi için) */
  newBlogPost$ = new Subject<{ blogPostId: number; title: string; author: string }>();

  startConnection(): void {
    const token = localStorage.getItem('token');
    if (!token || this.hubConnection) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.HUB_URL, {
        accessTokenFactory: () => localStorage.getItem('token') ?? ''
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.hubConnection.on('NewNotification', (payload: NewPostNotificationPayload) => {
      this.newNotification$.next(payload);
    });

    this.hubConnection.on('NewBlogPost', (payload: { blogPostId: number; title: string; author: string }) => {
      this.newBlogPost$.next(payload);
    });

    this.hubConnection
      .start()
      .catch(err => console.error('SignalR bağlantı hatası:', err));
  }

  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.hubConnection = null;
    }
  }

  ngOnDestroy(): void {
    this.stopConnection();
  }
}
