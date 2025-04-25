import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterPageComponent } from './register-page.component';
import { FormBuilder, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { AuthService } from '../../services/auth-services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { SnackBarUtil } from '../../shared/snackbar-util';
import { LoginPageComponent } from '../login-page/login-page.component';

describe('RegisterPageComponent', () => {
  let component: RegisterPageComponent;
  let fixture: ComponentFixture<RegisterPageComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['registerUser']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      declarations: [RegisterPageComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RegisterPageComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
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

  it('should call registerUser and navigate on successful registration', () => {
    const registerResponse = { message: 'Registration successful!' };
    authService.registerUser.and.returnValue(of(registerResponse));

    component.registerForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      userName: 'john_doe',
      email: 'john@example.com',
      phone: '+123456789',
      password: 'password123',
      confirmPassword: 'password123'
    });

    component.onRegister();

    expect(authService.registerUser).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      userName: 'john_doe',
      email: 'john@example.com',
      phone: '+123456789',
      password: 'password123',
      confirmPassword: 'password123'
    });
    expect(snackBar.open).toHaveBeenCalledWith('Registration successful!', 'success', { duration: 3000 });
    expect(component.registerForm.reset).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['login']);
  });

  it('should show error message when registration fails', () => {
    const errorResponse = { error: { message: 'Registration failed' } };
    authService.registerUser.and.returnValue(throwError(errorResponse));

    component.registerForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      userName: 'john_doe',
      email: 'john@example.com',
      phone: '+123456789',
      password: 'password123',
      confirmPassword: 'password123'
    });

    component.onRegister();

    expect(snackBar.open).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Registration failed');
  });

  it('should call validateAllFormFields when form is invalid on register', () => {
    spyOn(LoginPageComponent, 'validateAllFormFields');

    component.registerForm.setValue({
      firstName: '',
      lastName: '',
      userName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });

    component.onRegister();

    expect(LoginPageComponent.validateAllFormFields).toHaveBeenCalledWith(component.registerForm);
  });
});
