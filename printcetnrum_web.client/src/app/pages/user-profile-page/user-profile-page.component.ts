import { Component, inject, OnInit } from '@angular/core';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarUtil } from '../../shared/snackbar-util';

@Component({
  selector: 'app-user-profile-page',
  templateUrl: './user-profile-page.component.html',
  styleUrls: ['./user-profile-page.component.css']
})
export class UserProfilePageComponent implements OnInit {
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  showDeleteModal = false;
  user: User = {
    id: 0, firstName: '', lastName: '', userName: '', email: '', role: '',
    street: '', city: '', postalCode: ''
  };

  ngOnInit() {
    console.log('toto je moj user ' + this.authService.getfullNameFromToken());
    this.authService.getCurrentUser().subscribe((user: User) => {
      if (user) {
        this.user = user;
        console.log('toto je moj user' + this.user);
      }
    });
  }

  saveUser() {
    this.authService.updateUser(this.user.id, this.user).subscribe({
      next: () => SnackBarUtil.showSnackBar(this.snackBar, 'Changes saved successfully!', 'success'),
      error: () => SnackBarUtil.showSnackBar(this.snackBar, 'Something failed. Please try again.', 'error')
    });
  }

  openDeleteModal() {
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  deleteUser() {
    this.authService.deactivateUser(this.user.id).subscribe({
      next: () => {
        SnackBarUtil.showSnackBar(this.snackBar, 'Account deactivated successfully!', 'success');
        this.authService.logOut();
        this.showDeleteModal = false;
      },
      error: () => {
        SnackBarUtil.showSnackBar(this.snackBar, 'Failed to deactivate account.', 'error');
        this.showDeleteModal = false;
      }
    });
  }
}
