import { Component } from '@angular/core';

interface User {
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  users: User[] = [
    { name: 'Adam Novy', email: 'adam@example.com', role: 'Admin' },
    { name: 'Peter Stary', email: 'speter@example.com', role: 'User' },
    { name: 'Lojzo dalsi', email: 'lojzo@example.com', role: 'Customer' },
    { name: 'Zakaznik Z', email: 'zakaznik@example.com', role: 'Customer' }
  ];

  // Sorting logic (optional)
  sortByName() {
    this.users.sort((a, b) => a.name.localeCompare(b.name));
  }

  sortByEmail() {
    this.users.sort((a, b) => a.email.localeCompare(b.email));
  }

  sortByRole() {
    this.users.sort((a, b) => a.role.localeCompare(b.role));
  }
}
