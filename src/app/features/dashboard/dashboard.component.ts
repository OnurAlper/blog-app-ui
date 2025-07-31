import { Component, HostListener, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false
})
export class DashboardComponent implements OnInit {
  isScreenLarge = true;

  ngOnInit() {
    this.checkScreen();
  }

  @HostListener('window:resize')
  checkScreen() {
    // 768px ve üstü geniş ekran
    this.isScreenLarge = window.innerWidth >= 768;
  }

  // Küçük ekranda nav item’a tıklanınca menüyü kapat
  onNavListClick(sidenav: MatSidenav) {
    if (!this.isScreenLarge && sidenav.opened) {
      sidenav.close();
    }
  }
}
