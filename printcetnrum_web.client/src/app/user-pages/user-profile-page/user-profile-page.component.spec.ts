import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserProfilePageComponent } from './user-profile-page.component';
import { AuthService } from '../../services/auth-services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { SnackBarUtil } from '../../shared/snackbar-util';
import { User } from '../../models/user-models/user.model';

describe('UserProfilePageComponent', () => {
  let component: UserProfilePageComponent;
  let fixture: ComponentFixture<UserProfilePageComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'updateUser', 'setUserActivity', 'logOut', 'getfullNameFromToken']);
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      declarations: [UserProfilePageComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: MatSnackBar, useValue: snackBar }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UserProfilePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch user data on init', () => {
    const mockUser: User = {
      id: 1, firstName: 'John', lastName: 'Doe', userName: 'johndoe', email: 'john.doe@example.com', phone: '123456789', role: 'admin',
      street: '123 Main St', city: 'Sample City', postcode: '12345', isActive: true
    };

    authService.getCurrentUser.and.returnValue(of(mockUser));

    component.ngOnInit();

    expect(component.user).toEqual(mockUser);
    expect(authService.getCurrentUser).toHaveBeenCalled();
  });

  it('should call saveUser and show success message', () => {
    const mockUser: User = {
      id: 1, firstName: 'John', lastName: 'Doe', userName: 'johndoe', email: 'john.doe@example.com', phone: '123456789', role: 'admin',
      street: '123 Main St', city: 'Sample City', postcode: '12345', isActive: true
    };

    component.user = mockUser;
    authService.updateUser.and.returnValue(of(mockUser));

    component.saveUser();

    expect(authService.updateUser).toHaveBeenCalledWith(mockUser.id, mockUser);
    expect(snackBar.open).toHaveBeenCalledWith('Changes saved successfully!', 'success', { duration: 3000 });
  });

  it('should call saveUser and show error message on failure', () => {
    const mockUser: User = {
      id: 1, firstName: 'John', lastName: 'Doe', userName: 'johndoe', email: 'john.doe@example.com', phone: '123456789', role: 'admin',
      street: '123 Main St', city: 'Sample City', postcode: '12345', isActive: true
    };

    component.user = mockUser;
    authService.updateUser.and.returnValue(throwError(() => new Error('Update failed')));

    component.saveUser();

    expect(authService.updateUser).toHaveBeenCalledWith(mockUser.id, mockUser);
    expect(snackBar.open).toHaveBeenCalledWith('Something failed. Please try again.', 'error', { duration: 3000 });
  });

  it('should open delete modal', () => {
    component.openDeleteModal();
    expect(component.showDeleteModal).toBeTrue();
  });

  it('should close delete modal', () => {
    component.closeDeleteModal();
    expect(component.showDeleteModal).toBeFalse();
  });

  it('should call deleteUser and deactivate account', () => {
    const mockUser: User = {
      id: 1, firstName: 'John', lastName: 'Doe', userName: 'johndoe', email: 'john.doe@example.com', phone: '123456789', role: 'admin',
      street: '123 Main St', city: 'Sample City', postcode: '12345', isActive: true
    };

    component.user = mockUser;
    authService.setUserActivity.and.returnValue(of());
    authService.logOut.and.stub();

    component.deleteUser();

    expect(authService.setUserActivity).toHaveBeenCalledWith(mockUser.id, false);
    expect(snackBar.open).toHaveBeenCalledWith('Account deactivated successfully!', 'success', { duration: 3000 });
    expect(authService.logOut).toHaveBeenCalled();
    expect(component.showDeleteModal).toBeFalse();
  });

  it('should call deleteUser and show error message on failure', () => {
    const mockUser: User = {
      id: 1, firstName: 'John', lastName: 'Doe', userName: 'johndoe', email: 'john.doe@example.com', phone: '123456789', role: 'admin',
      street: '123 Main St', city: 'Sample City', postcode: '12345', isActive: true
    };

    component.user = mockUser;
    authService.setUserActivity.and.returnValue(throwError(() => new Error('Deactivation failed')));

    component.deleteUser();

    expect(authService.setUserActivity).toHaveBeenCalledWith(mockUser.id, false);
    expect(snackBar.open).toHaveBeenCalledWith('Failed to deactivate account.', 'error', { duration: 3000 });
    expect(component.showDeleteModal).toBeFalse();
  });
});
