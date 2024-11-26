import { Component } from '@angular/core';
import { User } from '../models/user.model';
import { AuthService } from '../services/auth.service';
import { UserStoreService } from '../services/user-store.service';

@Component({
  selector: 'app-users-list-page',
  templateUrl: './users-list-page.component.html',
  styleUrl: './users-list-page.component.css'
})
export class UsersListPageComponent {
  users: User[] = [];
  userName: string = "";
  userFound: User | null = null;
  constructor(private auth: AuthService, private userStore: UserStoreService) { }

  ngOnInit() {
    this.auth.getAllUsers().subscribe(
      (data: User[]) => {
        this.users = data;
        console.log(data);
        const uniqueNameToken = this.auth.getfullNameFromToken();

        if (uniqueNameToken) {

          this.userFound = this.users.find(user =>
            user.userName == uniqueNameToken 
          ) || null;

          if (this.userFound) {
            this.userName = `${this.userFound.firstName} ${this.userFound.lastName}`;
          } else {
            this.userName = "nevydalo";
          }
        }
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
