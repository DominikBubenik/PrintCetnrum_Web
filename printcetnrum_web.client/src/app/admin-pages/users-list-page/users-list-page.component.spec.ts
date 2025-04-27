import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersListPageComponent } from './users-list-page.component';
import { AuthService } from '../../services/auth-services/auth.service';
import { UserStoreService } from '../../services/auth-services/user-store.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { User } from '../../models/user-models/user.model';
import { FormsModule } from '@angular/forms';

const dummyUsers: User[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    userName: 'john123',
    email: 'john@example.com',
    phone: '1234567890',
    role: 'Admin',
    street: 'Main Street',
    city: 'Springfield',
    postcode: '12345',
    isActive: true
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    userName: 'jane_s',
    email: 'jane@example.com',
    phone: '0987654321',
    role: 'User',
    street: 'Second Street',
    city: 'Greendale',
    postcode: '54321',
    isActive: false
  }
];

describe('UsersListPageComponent', () => {
  let component: UsersListPageComponent;
  let fixture: ComponentFixture<UsersListPageComponent>;
  let mockAuthService: any;
  let mockUserStoreService: any;

  beforeEach(async () => {
    mockAuthService = {
      getAllUsers: jasmine.createSpy('getAllUsers').and.returnValue(of(dummyUsers)),
      logOut: jasmine.createSpy('logOut'),
      setUserActivity: jasmine.createSpy('setUserActivity').and.returnValue(of({ message: 'User deactivated' }))
    };

    mockUserStoreService = {
      updateUser: jasmine.createSpy('updateUser').and.returnValue(of({})),
      deleteUser: jasmine.createSpy('deleteUser').and.returnValue(of({}))
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, MatSnackBarModule],
      declarations: [UsersListPageComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserStoreService, useValue: mockUserStoreService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsersListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    expect(component.users.length).toBe(2);
    expect(component.filteredUsers.length).toBe(2);
  });

  it('should filter users by username', () => {
    component.searchedUsername = 'john';
    component.findUser();
    expect(component.filteredUsers.length).toBe(1);
    expect(component.filteredUsers[0].userName).toBe('john123');
  });

  it('should sort users by name', () => {
    component.sortByName();
    expect(component.users[0].firstName).toBe('Jane');
  });

  it('should open and close edit modal', () => {
    component.onEdit(dummyUsers[0]);
    expect(component.isModalVisible).toBeTrue();
    component.closeModal();
    expect(component.isModalVisible).toBeFalse();
  });

  it('should call logOut', () => {
    component.onLogout();
    expect(mockAuthService.logOut).toHaveBeenCalled();
  });

  it('should update user on save', () => {
    component.currentUser = { ...dummyUsers[0] };
    component.onSave();
    expect(mockUserStoreService.updateUser).toHaveBeenCalledWith(1, jasmine.any(Object));
  });

  it('should delete user on confirm', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.onDelete(1);
    expect(mockUserStoreService.deleteUser).toHaveBeenCalledWith(1);
  });

  it('should not delete user if not confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.onDelete(1);
    expect(mockUserStoreService.deleteUser).not.toHaveBeenCalled();
  });

  it('should call setUserActivity on confirm', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.changeActivity(2, false);
    expect(mockAuthService.setUserActivity).toHaveBeenCalledWith(2, false);
  });

  it('should not call setUserActivity if not confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.changeActivity(2, false);
    expect(mockAuthService.setUserActivity).not.toHaveBeenCalled();
  });
});
