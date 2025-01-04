import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  currentUrl: string | undefined;
  menuValue: boolean = false;
  menu_icon: string = 'bi bi-list';
  isLoggedIn: boolean = false;
  userName: string = '';
  constructor(
    private router: Router,
    private http: HttpClient,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    this.isLoggedIn = this.auth.isLoggedIn();
    if (this.isLoggedIn) {
      this.userName = this.auth.getfullNameFromToken();
    }

    this.router.events.subscribe(() => {
      this.currentUrl = this.router.url;
    });
  }

  openMenu() {
    this.menuValue = !this.menuValue;
    this.menu_icon = this.menuValue ? 'bi bi-x' : 'bi bi-list';
  }

  closeMenu() {
    this.menuValue = false;
    this.menu_icon = 'bi bi-list';
    console.log('ideeeeem close menu');
  }

  onLogout() {
    this.auth.logOut();
    this.isLoggedIn = false;
    this.userName = '';
  }
}
