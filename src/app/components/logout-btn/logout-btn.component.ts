import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout-btn',
  standalone: true,
  imports: [],
  templateUrl: './logout-btn.component.html',
  styleUrl: './logout-btn.component.css',
})
export class LogoutBtnComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
