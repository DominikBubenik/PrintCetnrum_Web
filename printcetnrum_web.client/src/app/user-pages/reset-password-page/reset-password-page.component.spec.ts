import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResetPasswordPageComponent } from './reset-password-page.component';
import { ReactiveFormsModule} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ResetPasswordService } from '../../services/auth-services/reset-password.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { LoginPageComponent } from '../login-page/login-page.component';
import { ResetPassword } from '../../models/user-models/reset-password.model';

describe('ResetPasswordPageComponent', () => {
  let component: ResetPasswordPageComponent;
  let fixture: ComponentFixture<ResetPasswordPageComponent>;
  let resetService: jasmine.SpyObj<ResetPasswordService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    const resetServiceSpy = jasmine.createSpyObj('ResetPasswordService', ['resetPassword']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['queryParams']);

    await TestBed.configureTestingModule({
      declarations: [ResetPasswordPageComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ResetPasswordService, useValue: resetServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ResetPasswordPageComponent);
    component = fixture.componentInstance;
    resetService = TestBed.inject(ResetPasswordService) as jasmine.SpyObj<ResetPasswordService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
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

  it('should call resetPassword and navigate on successful password reset', () => {
    const resetResponse = { message: 'Password Changed Successfully!' };
    resetService.resetPassword.and.returnValue(of(resetResponse));

    component.resetForm.setValue({
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123'
    });
    component.emailToReset = 'test@example.com';
    component.emailToken = 'some-valid-token';

    component.resetPasswordObject = new ResetPassword();
    component.resetPasswordObject.email = component.emailToReset;
    component.resetPasswordObject.emailToken = component.emailToken;
    component.resetPasswordObject.newPassword = 'newPassword123';
    component.resetPasswordObject.confirmPassword = 'newPassword123';

    component.onPasswordChange();

    expect(resetService.resetPassword).toHaveBeenCalledWith(component.resetPasswordObject);
    expect(snackBar.open).toHaveBeenCalledWith('Password Changed Successfully!', 'success', { duration: 3000 });
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });


  it('should show error message when password reset fails', () => {
    const errorResponse = { error: { message: 'Password Reset Failed' } };
    resetService.resetPassword.and.returnValue(throwError(errorResponse));

    component.resetForm.setValue({
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123'
    });
    component.emailToReset = 'test@example.com';
    component.emailToken = 'some-invalid-token';

    component.onPasswordChange();

    expect(snackBar.open).toHaveBeenCalledWith('Password Reset Failed. Please try again.', 'error', { duration: 3000 });
  });

  it('should call validateAllFormFields when form is invalid on password change', () => {
    spyOn(LoginPageComponent, 'validateAllFormFields');

    component.resetForm.setValue({
      newPassword: '',
      confirmPassword: ''
    });

    component.onPasswordChange();

    expect(LoginPageComponent.validateAllFormFields).toHaveBeenCalledWith(component.resetForm);
  });

  it('should extract email and token from query parameters', () => {
    activatedRoute.queryParams = of({ email: 'test@example.com', code: 'validToken' });
    component.ngOnInit();
    expect(component.emailToReset).toBe('test@example.com');
    expect(component.emailToken).toBe('validToken');
  });
});
