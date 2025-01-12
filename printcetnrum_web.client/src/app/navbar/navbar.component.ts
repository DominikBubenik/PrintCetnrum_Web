import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserStoreService } from '../services/user-store.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  authStore = inject(UserStoreService);
  auth = inject(AuthService);
  currentUrl: string | undefined;
  menuValue: boolean = false;
  menu_icon: string = 'bi bi-list';
  //isLoggedIn: boolean = false;
  isLoggedIn = signal<boolean>(false);
  userName: string = '';
  userNameSignal = signal<string>('');
  private subscription?: Subscription;
  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    this.isLoggedIn.set(this.auth.isLoggedIn());
    this.subscription = this.authStore.getFullNameFromStoreObservable().subscribe((fullName) => {
      console.log('navbar', this.authStore.getFullNameFromStore());
      if (this.authStore.getFullNameFromStore()) {
        this.userNameSignal.set(this.authStore.getFullNameFromStore());
      } else {
        this.userNameSignal.set(this.auth.getfullNameFromToken());
      }
      this.isLoggedIn.set(true);
    });
 

    this.router.events.subscribe(() => {
      this.currentUrl = this.router.url;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
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
    this.isLoggedIn.set(false);
    this.userName = '';
  }
}
