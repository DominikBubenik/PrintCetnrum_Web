import { Component, inject, signal } from '@angular/core';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarUtil } from '../../shared/snackbar-util';

@Component({
  selector: 'app-user-profile-page',
  templateUrl: './user-profile-page.component.html',
  styleUrl: './user-profile-page.component.css'
})
export class UserProfilePageComponent {
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  user = signal<User | undefined>(undefined);

  ngOnInit() {
    this.authService.getCurrentUser().subscribe((user: User) => {
      this.user.set(user);
    });
  }

  updateUserField(field: keyof User, value: string) {
    if (this.user()) {
      this.user.set({
        ...this.user()!,
        [field]: value
      });
    }
  }

  saveUser() {
    if (this.user()) {
      this.authService.updateUser(this.user()?.id ?? 0, this.user()!).subscribe(
        response => SnackBarUtil.showSnackBar(this.snackBar, 'Changes saved successfully!', 'success'),
        error => SnackBarUtil.showSnackBar(this.snackBar, 'Something failed. Please try again.', 'error')
      );
    }
  }
}
