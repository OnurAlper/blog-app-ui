import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from 'src/app/core/services/auth.service';
import { SignalRService } from 'src/app/core/services/signalr.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false
})
export class DashboardComponent implements OnInit, OnDestroy {
  isScreenLarge = true;

  constructor(public auth: AuthService, private signalR: SignalRService) {}

  ngOnInit(): void {
    this.checkScreen();
    this.signalR.startConnection();
  }

  ngOnDestroy(): void {
    this.signalR.stopConnection();
  }

  @HostListener('window:resize')
  checkScreen(): void {
    this.isScreenLarge = window.innerWidth >= 768;
  }

  onNavListClick(sidenav: MatSidenav): void {
    if (!this.isScreenLarge && sidenav.opened) {
      sidenav.close();
    }
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  isClient(): boolean {
    return this.auth.isClient();
  }
}
