import { Component } from '@angular/core';
import { User } from '../../models/user-models/user.model';
import { AuthService } from '../../services/auth-services/auth.service';
import { UserStoreService } from '../../services/auth-services/user-store.service';
import { SnackBarUtil } from '../../shared/snackbar-util';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-users-list-page',
  templateUrl: './users-list-page.component.html',
  styleUrls: ['./users-list-page.component.css']
})
export class UsersListPageComponent {
  users: User[] = [];
  searchedUsername: string = '';
  filteredUsers: User[] = [];
  currentUser: User | null = null;
  isModalVisible: boolean = false;

  constructor(
    private auth: AuthService,
    private userStore: UserStoreService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.auth.getAllUsers().subscribe(
      (data: User[]) => {
        this.users = data;
        this.filteredUsers = this.users;
      },
      (error) => {
        console.error('Error fetching users', error);
      }
    );
  }

  sortByName() {
    this.users.sort((a, b) => a.firstName.localeCompare(b.firstName));
  }

  sortByEmail() {
    this.users.sort((a, b) => a.email.localeCompare(b.email));
  }

  sortByRole() {
    this.users.sort((a, b) => a.role.localeCompare(b.role));
  }

  sortByUsername() {
    this.users.sort((a, b) => a.userName.localeCompare(b.userName));
  }

  sortByStreet() {
    this.users.sort((a, b) => a?.street.localeCompare(b?.street));
  }

  sortByCity() {
    this.users.sort((a, b) => a?.city.localeCompare(b?.city));
  }

  sortByPostcode() {
    this.users.sort((a, b) => a?.postcode.localeCompare(b?.postcode));
  }

  onLogout() {
    this.auth.logOut();
  }

  onEdit(user: User) {
    this.currentUser = { ...user };
    this.isModalVisible = true;
  }

  findUser() {
    this.filteredUsers = this.users.filter(user => user.userName.includes(this.searchedUsername));
  }

  onSave() {
    if (this.currentUser) {
      const updatedUser: User = {
        ...this.currentUser,
        firstName: this.currentUser.firstName,
        lastName: this.currentUser.lastName,
        email: this.currentUser.email,
        street: this.currentUser.street,
        city: this.currentUser.city,
        postcode: this.currentUser.postcode,
      };

      this.userStore.updateUser(this.currentUser.id, updatedUser).subscribe(
        () => {
          SnackBarUtil.showSnackBar(this.snackBar, 'User updated successfully', "success");
          this.loadUsers();
          this.closeModal();
        },
        (error) => {
          SnackBarUtil.showSnackBar(this.snackBar, 'Failed to update user', "error");
          console.error('Error updating user:', error);
        }
      );
    }
  }

  closeModal() {
    this.isModalVisible = false;
  }

  onDelete(userId: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userStore.deleteUser(userId).subscribe(
        () => {
          SnackBarUtil.showSnackBar(this.snackBar, 'User deleted successfully', "success");
          this.loadUsers();
        },
        (error) => {
          SnackBarUtil.showSnackBar(this.snackBar, 'Failed to delete user', "error");
          console.error('Error deleting user:', error);
        }
      );
    }
  }

  changeActivity(userId: number, isActive: boolean) {
    if (confirm('Are you sure you want to deactivate this user?')) {
      console.log('User ID:', userId + ' and activiti = ' + isActive);
      this.auth.setUserActivity(userId, isActive).subscribe(
        (response: any) => {
          SnackBarUtil.showSnackBar(this.snackBar, response.message, "success");
          console.log('User activity updated:', response);
          this.loadUsers();
        },
        (error) => {
          SnackBarUtil.showSnackBar(this.snackBar, 'Failed to deactivate user', "error");
          console.error('Error deleting user:', error);
        });
    }
  }
}
