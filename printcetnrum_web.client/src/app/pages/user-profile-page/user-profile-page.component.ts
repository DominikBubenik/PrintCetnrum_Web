import { Component, inject, signal } from '@angular/core';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarUtil } from '../../shared/snackbar-util';

@Component({
  selector: 'app-user-profile-page',
  templateUrl: './user-profile-page.component.html',
  styleUrls: ['./user-profile-page.component.css']
})
export class UserProfilePageComponent {
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  user = signal<User>({
    id: 0, firstName: '', lastName: '', userName: '', email: '', role: '',
    street: '', city: '', postalCode: ''
  });

  ngOnInit() {
    this.authService.getCurrentUser().subscribe((user: User) => {
      this.user.set(user); 
    });
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  updateUserField(field: keyof User, value: string) {
    this.user.update(user => ({
      ...user,
      [field]: value
    }));
  }

  saveUser() {
    this.authService.updateUser(this.user().id, this.user()).subscribe(
      response => SnackBarUtil.showSnackBar(this.snackBar, 'Changes saved successfully!', 'success'),
      error => SnackBarUtil.showSnackBar(this.snackBar, 'Something failed. Please try again.', 'error')
    );
  }
}
