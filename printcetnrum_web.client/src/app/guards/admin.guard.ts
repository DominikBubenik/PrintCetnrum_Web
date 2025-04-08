import { AuthService } from './../services/auth.service';
import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    if (this.auth.isLoggedIn() && this.auth.getRoleFromToken() === 'Admin') {
      return true
    } else {
      this.router.navigate(['login'])
      return false;
    }
  }
}
