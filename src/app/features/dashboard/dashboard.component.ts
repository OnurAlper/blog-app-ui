import { Component, HostListener, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from 'src/app/core/services/auth.service'; // ✅ Role kontrol için

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false
})
export class DashboardComponent implements OnInit {
  isScreenLarge = true;

  constructor(public auth: AuthService) {} // ✅ HTML’de role kontrolü için public

  ngOnInit(): void {
    this.checkScreen();
  }

  @HostListener('window:resize')
  checkScreen(): void {
    // 768px ve üstü geniş ekran
    this.isScreenLarge = window.innerWidth >= 768;
  }

  // Küçük ekranda nav item’a tıklanınca menüyü kapat
  onNavListClick(sidenav: MatSidenav): void {
    if (!this.isScreenLarge && sidenav.opened) {
      sidenav.close();
    }
  }

  // ✅ Role kontrol metotları
  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  isClient(): boolean {
    return this.auth.isClient();
  }
}
