import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-services/auth.service';
import { UserStoreService } from '../services/auth-services/user-store.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let userStoreSpy: jasmine.SpyObj<UserStoreService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', [
      'logOut',
      'getRoleFromToken',
      'getfullNameFromToken'
    ]);

    const userStore = jasmine.createSpyObj('UserStoreService', [
      'getRoleFromStore',
      'getFullNameFromStore',
      'getFullNameFromStoreObservable'
    ]);

    const router = jasmine.createSpyObj('Router', ['navigate'], {
      url: '/home',
      events: of({}) // simulate route changes
    });

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [NavbarComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: UserStoreService, useValue: userStore },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userStoreSpy = TestBed.inject(UserStoreService) as jasmine.SpyObj<UserStoreService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Default mock behavior
    userStoreSpy.getRoleFromStore.and.returnValue(of('Admin'));
    userStoreSpy.getFullNameFromStore.and.returnValue('Dominik');
    userStoreSpy.getFullNameFromStoreObservable.and.returnValue(of('Dominik'));
    authServiceSpy.getRoleFromToken.and.returnValue('Admin');
    authServiceSpy.getfullNameFromToken.and.returnValue('Dominik');

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show admin role if role is Admin', () => {
    expect(component.isAdmin).toBeTrue();
  });

  it('should set isLoggedIn and userNameSignal on init', () => {
    expect(component.isLoggedIn()).toBeTrue();
    expect(component.userNameSignal()).toBe('Dominik');
  });

  it('should toggle menu and icon', () => {
    expect(component.menuValue).toBeFalse();
    component.openMenu();
    expect(component.menuValue).toBeTrue();
    expect(component.menu_icon).toBe('bi bi-x');

    component.openMenu();
    expect(component.menuValue).toBeFalse();
    expect(component.menu_icon).toBe('bi bi-list');
  });

  it('should close the menu', () => {
    component.menuValue = true;
    component.closeMenu();
    expect(component.menuValue).toBeFalse();
    expect(component.menu_icon).toBe('bi bi-list');
  });

  it('should toggle dropdown open state', () => {
    const fakeEvent = new Event('click');
    spyOn(fakeEvent, 'stopPropagation');
    component.toggleDropdown(fakeEvent);
    expect(component.dropdownOpen).toBeTrue();
    component.toggleDropdown(fakeEvent);
    expect(component.dropdownOpen).toBeFalse();
  });

  it('should close dropdown on outside click', () => {
    component.dropdownOpen = true;
    const mockEvent = {
      target: {
        closest: () => false
      }
    };
    component.closeDropdownOnClickOutside(mockEvent);
    expect(component.dropdownOpen).toBeFalse();
  });

  it('should call logout, reset signals and navigate to login', () => {
    component.onLogout();
    expect(authServiceSpy.logOut).toHaveBeenCalled();
    expect(component.isLoggedIn()).toBeFalse();
    expect(component.userNameSignal()).toBe('');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to user profile when showUserProfile is called', () => {
    component.showUserProfile();
    expect(component.dropdownOpen).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/userProfile']);
  });

  it('should unsubscribe and remove event listener on destroy', () => {
    const unsubscribeSpy = spyOn(component['subscription']!, 'unsubscribe');
    const removeListenerSpy = spyOn(document, 'removeEventListener');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
    expect(removeListenerSpy).toHaveBeenCalled();
  });
});
