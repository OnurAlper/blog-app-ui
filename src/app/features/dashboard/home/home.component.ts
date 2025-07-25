import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { GetUserDto } from 'src/app/core/models/user.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false
})
export class HomeComponent implements OnInit {
  user: GetUserDto | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    const userId = Number(localStorage.getItem('userId'));

    if (userId) {
      this.userService.getById(userId).subscribe({
        next: (res) => {
          this.user = res.data;
        },
        error: (err) => {
          console.error('Kullanıcı bilgisi alınamadı:', err);
        }
      });
    }
  }
}
