import { Component } from '@angular/core';
import { User } from '../models/user.model';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-users-list-page',
  templateUrl: './users-list-page.component.html',
  styleUrl: './users-list-page.component.css'
})
export class UsersListPageComponent {
  users: User[] = [];

  constructor(private auth: AuthService) { }

  ngOnInit() {
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
}
