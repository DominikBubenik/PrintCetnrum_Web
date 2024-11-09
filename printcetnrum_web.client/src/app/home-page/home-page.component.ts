import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';


@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
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
}
