import { Component } from '@angular/core';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { UserStoreService } from '../../services/user-store.service';

@Component({
  selector: 'app-users-list-page',
  templateUrl: './users-list-page.component.html',
  styleUrls: ['./users-list-page.component.css']
})
export class UsersListPageComponent {
  users: User[] = [];
  userName: string = "";
  currentUser: User | null = null;
  isModalVisible: boolean = false;

  constructor(private auth: AuthService, private userStore: UserStoreService) { }

  ngOnInit() {
    this.loadUsers();
    const uniqueNameToken = this.auth.getfullNameFromToken();

    if (uniqueNameToken) {
      this.userName = uniqueNameToken;
    } else {
      this.userName = "Unknown User";
    }
  }

  loadUsers() {
    this.auth.getAllUsers().subscribe(
      (data: User[]) => {
        this.users = data;
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

  onLogout() {
    this.auth.logOut();
  }

  onEdit(user: User) {
    this.currentUser = { ...user };
    this.isModalVisible = true;
  }

  onSave() {
    if (this.currentUser) {
      const updatedUser: User = {
        ...this.currentUser,
        firstName: this.currentUser.firstName,
        lastName: this.currentUser.lastName,
        email: this.currentUser.email
      };

      this.userStore.updateUser(this.currentUser.id, updatedUser).subscribe(
        () => {
          alert('User updated successfully');
          this.loadUsers();
          this.closeModal();
        },
        (error) => {
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
          alert('User deleted successfully');
          this.loadUsers();
        },
        (error) => {
          console.error('Error deleting user:', error);
        }
      );
    }
  }
}
