import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPageComponent } from './login-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserStoreService } from "../../services/auth-services/user-store.service";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ResetPasswordService } from '../../services/auth-services/reset-password.service';
import { of, throwError } from 'rxjs';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let userStore: jasmine.SpyObj<UserStoreService>;
  let modalService: jasmine.SpyObj<NgbModal>;
  let resetService: jasmine.SpyObj<ResetPasswordService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['loginUser', 'storeToken', 'storeRefreshToken', 'decodedToken']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const userStoreSpy = jasmine.createSpyObj('UserStoreService', ['setFullNameForStore', 'setRoleForStore']);
    const modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);
    const resetServiceSpy = jasmine.createSpyObj('ResetPasswordService', ['sendResetPasswordLink']);

    await TestBed.configureTestingModule({
      declarations: [LoginPageComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: UserStoreService, useValue: userStoreSpy },
        { provide: NgbModal, useValue: modalServiceSpy },
        { provide: ResetPasswordService, useValue: resetServiceSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    userStore = TestBed.inject(UserStoreService) as jasmine.SpyObj<UserStoreService>;
    modalService = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    resetService = TestBed.inject(ResetPasswordService) as jasmine.SpyObj<ResetPasswordService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle password visibility', () => {
    expect(component.isPasswordVisible).toBeFalse();
    component.togglePasswordVisibility();
    expect(component.isPasswordVisible).toBeTrue();
    component.togglePasswordVisibility();
    expect(component.isPasswordVisible).toBeFalse();
  });

  it('should call loginUser and navigate on successful login', () => {
    const loginResponse = { accessToken: 'token', refreshToken: 'refreshToken' };
    authService.loginUser.and.returnValue(of(loginResponse));
    authService.decodedToken.and.returnValue({ unique_name: 'user', role: 'admin' });

    component.loginForm.setValue({ username: 'test', password: 'password' });
    component.onLogin();

    expect(authService.loginUser).toHaveBeenCalledWith({ username: 'test', password: 'password' });
    expect(authService.storeToken).toHaveBeenCalledWith('token');
    expect(authService.storeRefreshToken).toHaveBeenCalledWith('refreshToken');
    expect(userStore.setFullNameForStore).toHaveBeenCalledWith('user');
    expect(userStore.setRoleForStore).toHaveBeenCalledWith('admin');
    expect(snackBar.open).toHaveBeenCalledWith('Login successful!', 'success', { duration: 3000 });
    expect(router.navigate).toHaveBeenCalledWith(['']);
  });

  it('should show error snackbar on login failure', () => {
    const errorResponse = { error: { message: 'Invalid credentials' } };
    authService.loginUser.and.returnValue(throwError(errorResponse));

    component.loginForm.setValue({ username: 'test', password: 'wrongpassword' });
    component.onLogin();

    expect(snackBar.open).toHaveBeenCalledWith('Invalid credentials', 'error', { duration: 3000 });
  });

  it('should call validateAllFormFields when form is invalid on login', () => {
    spyOn(LoginPageComponent, 'validateAllFormFields');

    component.loginForm.setValue({ username: '', password: '' });
    component.onLogin();

    expect(LoginPageComponent.validateAllFormFields).toHaveBeenCalledWith(component.loginForm);
  });

  it('should open modal when open method is called', () => {
    const modalRef = {} as any;
    modalService.open.and.returnValue(modalRef);

    component.open(modalRef);

    expect(modalService.open).toHaveBeenCalledWith(modalRef);
  });

  it('should send reset link and show success snackbar', () => {
    resetService.sendResetPasswordLink.and.returnValue(of({}));

    component.forgotEmail = 'test@example.com';
    component.sendResetLink();

    expect(resetService.sendResetPasswordLink).toHaveBeenCalledWith('test@example.com');
    expect(snackBar.open).toHaveBeenCalledWith('Reset link sent successfully.', 'success', { duration: 3000 });
  });

  it('should show error snackbar when sending reset link fails', () => {
    resetService.sendResetPasswordLink.and.returnValue(throwError({}));

    component.forgotEmail = 'test@example.com';
    component.sendResetLink();

    expect(snackBar.open).toHaveBeenCalledWith('Something went wrong. Please try again.', 'error', { duration: 3000 });
  });

  it('should check valid email format', () => {
    expect(component.checkValidEmail('test@example.com')).toBeTrue();
    expect(component.checkValidEmail('invalidemail')).toBeFalse();
  });
});
