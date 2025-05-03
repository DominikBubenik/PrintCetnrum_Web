import { AuthService } from '../services/auth-services/auth.service';
import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserStoreService } from '../services/auth-services/user-store.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private auth = inject(AuthService);
  private userStore = inject(UserStoreService);
  private router = inject(Router);

  canActivate(): boolean {
    let role = this.auth.getRoleFromToken();
    if (!role) {
      role = this.userStore.getRoleFromStore();
    }
    if (this.auth.isLoggedIn() && role === 'Admin') {
      return true
    } else {
      this.router.navigate(['login'])
      return false;
    }
  }
}
