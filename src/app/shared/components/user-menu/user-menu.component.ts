import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
  standalone: false
})
export class UserMenuComponent {
  fullName: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    const name = user?.name || '';
    const surname = user?.surname || '';
    this.fullName = `${name} ${surname}`.trim();
  }

  goToProfile(): void {
    this.router.navigate(['/profile']); // ✅ yönlendirme artık route üzerinden
  }

  logout(): void {
    this.authService.logout();
  }
}
