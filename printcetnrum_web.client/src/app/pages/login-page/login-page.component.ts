import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserStoreService } from "../../services/user-store.service";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ResetPasswordService } from '../../services/reset-password.service';
import { SnackBarUtil } from '../../shared/snackbar-util';


@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  isPasswordVisible: boolean = false;
  loginForm!: FormGroup;
  forgotEmail?: string;
  isValidEmail: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private userStore: UserStoreService,
    private modalService: NgbModal,
    private resetService: ResetPasswordService
  ) { }

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
        error: () => {
          SnackBarUtil.showSnackBar(this.snackBar, 'Login failed. Please try again.', 'error');
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
