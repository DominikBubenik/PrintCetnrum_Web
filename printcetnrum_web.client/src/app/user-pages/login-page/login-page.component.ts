import { Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../../services/auth-services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserStoreService } from "../../services/auth-services/user-store.service";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ResetPasswordService } from '../../services/auth-services/reset-password.service';
import { SnackBarUtil } from '../../shared/snackbar-util';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private userStore = inject(UserStoreService);
  private modalService = inject(NgbModal);
  private resetService = inject(ResetPasswordService);
  isPasswordVisible: boolean = false;
  loginForm!: FormGroup;
  forgotEmail?: string;
  isValidEmail: boolean = false;

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required],
    });
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.authService.loginUser(this.loginForm.value).subscribe({
        next: (res) => {
          this.authService.storeToken(res.accessToken);
          this.authService.storeRefreshToken(res.refreshToken);
          const tokenPayload = this.authService.decodedToken();
          this.userStore.setFullNameForStore(tokenPayload.unique_name);
          this.userStore.setRoleForStore(tokenPayload.role);
          SnackBarUtil.showSnackBar(this.snackBar, 'Login successful!', 'success');
          this.loginForm.reset();
          this.router.navigate(['']);
        },
        error: (err) => {
          SnackBarUtil.showSnackBar(this.snackBar, err.error.message, 'error');
        },
      });
    } else {
      LoginPageComponent.validateAllFormFields(this.loginForm);
    }
  }

  static validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsDirty({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  open(forgotModal: any) {
    this.modalService.open(forgotModal);
  }

  sendResetLink() {
    if (this.checkValidEmail(this.forgotEmail ?? '')) {
      this.resetService.sendResetPasswordLink(this.forgotEmail!).subscribe({
        next: () => {
          this.forgotEmail = '';
          this.modalService.dismissAll();
          SnackBarUtil.showSnackBar(this.snackBar, 'Reset link sent successfully.', 'success');
        },
        error: () => {
          SnackBarUtil.showSnackBar(this.snackBar, 'Something went wrong. Please try again.', 'error');
        }
      });
    }
  }

  checkValidEmail(event: string): boolean {
    this.isValidEmail = event.includes('@') && event.includes('.');
    return this.isValidEmail;
  }
}
