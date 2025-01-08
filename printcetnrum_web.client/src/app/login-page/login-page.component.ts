import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserStoreService } from "../services/user-store.service";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ResetPasswordService } from '../services/reset-password.service';


/** TODO make the form look better
 * add option to log in via Google
 */
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
      username: ['', [Validators.required]], // Validators.email
      password: ['', Validators.required],
    });
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onLogin() {
    console.log(this.loginForm.value);
    if (this.loginForm.valid) {
      console.log('Form submitted', this.loginForm.value);
      this.authService.loginUser(this.loginForm.value).subscribe({
        next: (res) => {
          this.authService.storeToken(res.accessToken);
          this.authService.storeRefreshToken(res.refreshToken);
          const tokenPayload = this.authService.decodedToken();
          this.userStore.setFullNameForStore(tokenPayload.unique_name);
          this.userStore.setRoleForStore(tokenPayload.role);
          this.snackBar.open('Login successful!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'app-notification-success'
          });
          this.loginForm.reset();
          this.router.navigate(['']);
        },
        error: (err) => {
          this.snackBar.open('Login failed. Please try again.', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'app-notification-error',
          });
          console.log(err);
        },
      });
    } else {
      console.log('Form not valid');
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
    this.modalService.open(forgotModal); // Open the modal using template reference
  }

  // Handle reset link logic
  sendResetLink() {
    if (this.checkValidEmail(this.forgotEmail ?? '')) {
      console.log('Reset link sent to', this.forgotEmail);
      this.resetService.sendResetPasswordLink(this.forgotEmail!).subscribe({
        next: (res) => {
          this.forgotEmail = '';
          this.modalService.dismissAll();
          this.snackBar.open('Link Send', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'app-notification-success'
          });
        },
        error: (err) => {
          this.snackBar.open('Sth failed. Please try again.', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'app-notification-error',
          });
      }
      })
    
    }
  }
  

  checkValidEmail(event: string) {
    const value = event;
    this.isValidEmail = value.includes('@') && value.includes('.');
    return this.isValidEmail;
  }

    
  //}
}
